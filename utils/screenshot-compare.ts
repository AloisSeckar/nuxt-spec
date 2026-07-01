import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { decode, type DecodedPng } from 'fast-png'
import { expect } from 'vitest'
import { appendToReportFile, ensureReportCreated } from './screenshot-report'
import pixelmatch from 'pixelmatch'
import type { NuxtPage } from '@nuxt/test-utils'

export interface CompareScreenshotOptions {
  /** Name of the PNG file used for baseline storage and comparison (defaults to route and `index.png` for `/`) */
  fileName?: string
  /** Directory for baseline/current screenshots, relative to project root (defaults to `test/e2e`) */
  targetDir?: string
  /** CSS selector for a specific element to capture (defaults to full page) */
  selector?: string
  /** Max ratio of different pixels (0–1). Default: 0 (exact match) */
  maxDiffPixelRatio?: number
  /** Max absolute number of different pixels. Takes precedence over `maxDiffPixelRatio` when set. Default: 0 (exact match) */
  maxDiffPixels?: number
  /** Per-pixel color distance threshold (0–1). Lower = stricter. Default: 0.1 */
  threshold?: number
}

// capture a browser screenshot and compare it against a stored baseline PNG
export async function compareScreenshot(page: NuxtPage, options?: CompareScreenshotOptions): Promise<boolean> {
  const root = process.cwd()

  // ensure the target directory stays within the project root
  const dir = resolveWithin(root, options?.targetDir ?? 'test/e2e')

  // create report file on first call
  ensureReportCreated(dir)

  const baselineDir = resolve(dir, '__baseline__')
  const currentDir = resolve(dir, '__current__')

  const route = page.url().substring(page.url().lastIndexOf('/') + 1) || 'index'
  const fileName = options?.fileName ?? `${route}.png`

  // warning on custom non-png file extensions
  if (!fileName.toLowerCase().endsWith('.png')) {
    console.warn(`Screenshots from \`compareScreenshot\` are always saved as PNG. Consider different file name than '${fileName}'.`)
  }

  // ensure the file name cannot escape its target directory
  const baselinePath = resolveWithin(baselineDir, fileName)
  const currentPath = resolveWithin(currentDir, fileName)

  // capture element specified by locator or a full-page screenshot as PNG
  const screenshot = options?.selector
    ? await page.locator(options.selector).screenshot()
    : await page.screenshot({ fullPage: true })

  // always save the current screenshot for inspection
  mkdirSync(currentDir, { recursive: true })
  writeFileSync(currentPath, screenshot)

  // @ts-expect-error - this is reliable way of reading Vitest "update" flag
  const updating = expect.getState().snapshotState?._updateSnapshot === 'all'
  if (updating || !existsSync(baselinePath)) {
    // save new baseline screenshot
    mkdirSync(baselineDir, { recursive: true })
    writeFileSync(baselinePath, screenshot)
    return true
  }

  // compare against stored baseline PNG using pixelmatch
  const baseline = readFileSync(baselinePath)
  const baselineImg = decode(baseline)
  const actualImg = decode(screenshot)
  const { width, height } = baselineImg

  if (actualImg.width !== width || actualImg.height !== height) {
    const message = `Screenshot size mismatch: expected ${width}x${height}, got ${actualImg.width}x${actualImg.height}. Actual saved to: ${currentPath}`
    appendToReport(fileName, message, baseline, screenshot)
    expect.fail(message)
  }

  const diffCount = pixelmatch(toRGBA(baselineImg), toRGBA(actualImg), undefined, width, height, {
    threshold: options?.threshold ?? 0.1,
  })

  const totalPixels = width * height
  const maxAllowed = options?.maxDiffPixels ?? Math.ceil(totalPixels * (options?.maxDiffPixelRatio ?? 0))

  if (diffCount > maxAllowed) {
    const ratio = (diffCount / totalPixels * 100).toFixed(2)
    const message = `Screenshot mismatch: ${diffCount} pixels differ (${ratio}%), allowed ${maxAllowed}. Actual saved to: ${currentPath}`
    appendToReport(fileName, message, baseline, screenshot)
    expect.fail(message)
  }

  return true
}

// helper to make sure passed options are not escaping from cwd
export function resolveWithin(base: string, segment: string): string {
  const target = resolve(base, segment)
  if (target !== base && !target.startsWith(base + sep)) {
    throw new Error(`Invalid path: "${segment}" resolves outside of "${base}"`)
  }
  return target
}

// escape a string for safe interpolation into the HTML report
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
  }[char] ?? char))
}

const HTML_DIR = resolve(fileURLToPath(import.meta.url), '..', 'html')
const REPORT_ENTRY = readFileSync(resolve(HTML_DIR, 'report-entry.html'), 'utf-8')

// append a side-by-side baseline/actual comparison
// to the HTML report if the screenshots don't match
function appendToReport(fileName: string, message: string, baseline: Uint8Array, actual: Uint8Array): void {
  const baselineUri = `data:image/png;base64,${Buffer.from(baseline).toString('base64')}`
  const actualUri = `data:image/png;base64,${Buffer.from(actual).toString('base64')}`

  const entry = REPORT_ENTRY
    .replace('{{FILE_NAME}}', escapeHtml(fileName))
    .replace('{{MESSAGE}}', escapeHtml(message))
    .replace('{{BASELINE_URI}}', baselineUri)
    .replace('{{ACTUAL_URI}}', actualUri)

  appendToReportFile(entry)
}

// helper for bridging difference between Vitest PNG saving and fast-png encoding
function toRGBA(img: DecodedPng): Uint8Array {
  const { width, height, data, channels = 4 } = img
  if (channels === 4) return data as Uint8Array
  const pixels = width * height
  const rgba = new Uint8Array(pixels * 4)
  for (let i = 0; i < pixels; i++) {
    rgba[i * 4] = data[i * 3]
    rgba[i * 4 + 1] = data[i * 3 + 1]
    rgba[i * 4 + 2] = data[i * 3 + 2]
    rgba[i * 4 + 3] = 255
  }
  return rgba
}
