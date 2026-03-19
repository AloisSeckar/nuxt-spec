import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect } from 'vitest'
import { PNG } from 'pngjs'
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
  const dir = resolve(process.cwd(), options?.targetDir ?? 'test/e2e')
  const baselineDir = resolve(dir, '__baseline__')
  const currentDir = resolve(dir, '__current__')

  const route = page.url().substring(page.url().lastIndexOf('/') + 1) || 'index'
  const fileName = options?.fileName ?? `${route}.png`

  // capture element specified by locator or a full-page screenshot as PNG
  const screenshot = options?.selector
    ? await page.locator(options.selector).screenshot()
    : await page.screenshot({ fullPage: true })
  const baselinePath = resolve(baselineDir, fileName)

  // always save the current screenshot for inspection
  mkdirSync(currentDir, { recursive: true })
  writeFileSync(resolve(currentDir, fileName), screenshot)

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
  const baselineImg = PNG.sync.read(baseline)
  const actualImg = PNG.sync.read(screenshot)
  const { width, height } = baselineImg

  if (actualImg.width !== width || actualImg.height !== height) {
    expect.fail(`Screenshot size mismatch: expected ${width}x${height}, got ${actualImg.width}x${actualImg.height}. Actual saved to: ${resolve(currentDir, fileName)}`)
  }

  const diffCount = pixelmatch(baselineImg.data, actualImg.data, undefined, width, height, {
    threshold: options?.threshold ?? 0.1,
  })

  const totalPixels = width * height
  const maxAllowed = options?.maxDiffPixels ?? Math.ceil(totalPixels * (options?.maxDiffPixelRatio ?? 0))

  if (diffCount > maxAllowed) {
    const ratio = (diffCount / totalPixels * 100).toFixed(2)
    expect.fail(`Screenshot mismatch: ${diffCount} pixels differ (${ratio}%), allowed ${maxAllowed}. Actual saved to: ${resolve(currentDir, fileName)}`)
  }

  return true
}
