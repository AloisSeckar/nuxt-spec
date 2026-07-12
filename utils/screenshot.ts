import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { decode } from 'fast-png'
import { expect } from 'vitest'
import { appendToReport, ensureReportCreated, resolveWithin, screenshotSetup, toRGBA } from './screenshot/report-utils'
import pixelmatch from 'pixelmatch'
import type { NuxtPage } from '@nuxt/test-utils'
import { checkPageParam } from './helpers/check-params'

/**
 * Extra settings object for `compareScreenshot()` function.
 * All properties are optional.
 */
export type CompareScreenshotOptions = {
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

/**
 * Capture a browser screenshot and compare it against a stored baseline PNG.
 * When run with `-u` / `--update`, or when no baseline exists yet, the current
 * screenshot is saved as the new baseline.
 *
 * Comparison uses pixelmatch for perceptual pixel diffing. By default,
 * zero differing pixels are allowed (exact match). Set `maxDiffPixelRatio`
 * or `maxDiffPixels` to tolerate cross-platform rendering differences.
 *
 * @param page - Playwright page instance obtained from `createPage()`
 * @param options - Optional extra settings (see `CompareScreenshotOptions`)
 * @returns `true` when the screenshot matches the baseline (or a new baseline was saved)
 * @throws Fails the current Vitest test when a mismatch is detected
 */
export async function compareScreenshot(page: NuxtPage, options?: CompareScreenshotOptions): Promise<boolean> {
  checkPageParam('compareScreenshot:page', page)

  const root = process.cwd()

  // ensure the target directory stays within the project root
  const dir = resolveWithin(root, options?.targetDir ?? 'test/e2e')
  mkdirSync(dir, { recursive: true })

  // ensure baseline/current directories exist
  const baselineDir = resolve(dir, '__baseline__')
  mkdirSync(baselineDir, { recursive: true })
  const currentDir = resolve(dir, '__current__')
  mkdirSync(currentDir, { recursive: true })

  // create report file on first call
  ensureReportCreated(dir)

  // compute screenshot file name
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
  writeFileSync(currentPath, screenshot)

  // save baseline if not exist yet
  if (!existsSync(baselinePath)) {
    writeFileSync(baselinePath, screenshot)
    return true
  }

  // @ts-expect-error - this is reliable way of reading Vitest "update" flag
  const updateFlag = expect.getState().snapshotState?._updateSnapshot === 'all'

  // compare against stored baseline PNG using pixelmatch
  const baseline = readFileSync(baselinePath)
  const baselineImg = decode(baseline)
  const actualImg = decode(screenshot)
  const { width, height } = baselineImg

  if (actualImg.width !== width || actualImg.height !== height) {
    // overwrite baseline if Vitest update flag is set
    if (updateFlag) {
      writeFileSync(baselinePath, screenshot)
      return true
    }
    // otherwise report failure
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
    // overwrite baseline if Vitest update flag is set
    if (updateFlag) {
      writeFileSync(baselinePath, screenshot)
      return true
    }
    // otherwise report failure
    const ratio = (diffCount / totalPixels * 100).toFixed(2)
    const message = `Screenshot mismatch: ${diffCount} pixels differ (${ratio}%), allowed ${maxAllowed}. Actual saved to: ${currentPath}`
    appendToReport(fileName, message, baseline, screenshot)
    expect.fail(message)
  }

  return true
}

// Vitest globalSetup entry point
// - computes stable timestamp values and exposes them via env variables
// - the report file itself is created lazily on first compareScreenshot call
// - provides a callback to close the HTML report once tests are finished (if it was created)
export default function setup() {
  // the function itself is defined in the helper file
  // to avoid imports here and there
  return screenshotSetup()
}
