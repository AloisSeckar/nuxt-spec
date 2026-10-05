import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { decode } from 'fast-png'
import { expect, recordArtifact, TestRunner } from 'vitest'
import type { TestArtifactBase, TestAttachment } from 'vitest'
import { resolveWithin, toRGBA } from './helpers/screenshot-utils'
import pixelmatch from 'pixelmatch'
import type { GotoOptions, NuxtPage } from '@nuxt/test-utils'
import { checkNumberParam, checkPageParam, checkStringParam } from './helpers/check-params'
import { gotoPage } from './e2e'

/**
 * Test artifact recorded by `compareScreenshot()` on mismatch.
 * It is consumed by the Nuxt Spec HTML reporter.
 */
export interface NuxtSpecScreenshotArtifact extends TestArtifactBase {
  type: 'nuxt-spec:screenshot'
  /** Name of the compared PNG file */
  fileName: string
  /** Description of the mismatch */
  message: string
  attachments: Array<TestAttachment & { name: 'baseline' | 'actual' }>
}

declare module 'vitest' {
  interface TestArtifactRegistry {
    'nuxt-spec:screenshot': NuxtSpecScreenshotArtifact
  }
}

/**
 * Extra settings object for `compareScreenshot()` function.
 * All properties are optional.
 */
export type CompareScreenshotOptions = {
  /** Event to be awaited before NuxtPage instance is returned (defaults to `'hydration'`) */
  waitUntil?: GotoOptions['waitUntil']
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
 * @param page - Playwright page instance, or a page name string (will call `gotoPage` internally)
 * @param options - Optional extra settings (see `CompareScreenshotOptions`)
 * @returns `true` when the screenshot matches the baseline (or a new baseline was saved)
 * @throws Fails the current Vitest test when a mismatch is detected
 */
export async function compareScreenshot(page: NuxtPage | string, options?: CompareScreenshotOptions): Promise<boolean> {
  const { waitUntil, fileName, targetDir, selector, maxDiffPixelRatio, maxDiffPixels, threshold } = options || {}

  // get NuxtPage instance
  const pageInstance = typeof page === 'string' ? await gotoPage(page, { waitUntil }) : page
  checkPageParam('compareScreenshot:pageInstance', pageInstance)

  // verify params
  if (typeof page === 'string') {
    checkStringParam('compareScreenshot:page', page)
  }
  if (waitUntil) {
    checkStringParam('compareScreenshot:options.waitUntil', waitUntil)
  }
  if (fileName) {
    checkStringParam('compareScreenshot:options.fileName', fileName)
  }
  if (targetDir) {
    checkStringParam('compareScreenshot:options.targetDir', targetDir)
  }
  if (selector) {
    checkStringParam('compareScreenshot:options.selector', selector)
  }
  if (maxDiffPixelRatio !== undefined) {
    checkNumberParam('compareScreenshot:options.maxDiffPixelRatio', maxDiffPixelRatio)
  }
  if (maxDiffPixels !== undefined) {
    checkNumberParam('compareScreenshot:options.maxDiffPixels', maxDiffPixels)
  }
  if (threshold !== undefined) {
    checkNumberParam('compareScreenshot:options.threshold', threshold)
  }

  // ensure the target directory stays within the project root
  const root = process.cwd()
  const dir = resolveWithin(root, targetDir ?? 'test/e2e')
  mkdirSync(dir, { recursive: true })

  // ensure baseline/current directories exist
  const baselineDir = resolve(dir, '__baseline__')
  mkdirSync(baselineDir, { recursive: true })
  const currentDir = resolve(dir, '__current__')
  mkdirSync(currentDir, { recursive: true })

  // compute screenshot file name
  const route = pageInstance.url().substring(pageInstance.url().lastIndexOf('/') + 1) || 'index'
  const screenshotFile = fileName ?? `${route}.png`

  // warning on custom non-png file extensions
  if (!screenshotFile.toLowerCase().endsWith('.png')) {
    console.warn(`[Nuxt Spec] Screenshots from \`compareScreenshot\` are always saved as PNG. Consider different file name than '${screenshotFile}'.`)
  }

  // ensure the file name cannot escape its target directory
  const baselinePath = resolveWithin(baselineDir, screenshotFile)
  const currentPath = resolveWithin(currentDir, screenshotFile)

  // capture element specified by locator or a full-page screenshot as PNG
  const screenshot = selector
    ? await pageInstance.locator(selector).screenshot()
    : await pageInstance.screenshot({ fullPage: true })

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
    await reportMismatch(screenshotFile, message, baseline, screenshot)
    expect.fail(message)
  }

  const diffCount = pixelmatch(toRGBA(baselineImg), toRGBA(actualImg), undefined, width, height, {
    threshold: threshold ?? 0.1,
  })

  const totalPixels = width * height
  const maxAllowed = maxDiffPixels ?? Math.ceil(totalPixels * (maxDiffPixelRatio ?? 0))

  if (diffCount > maxAllowed) {
    // overwrite baseline if Vitest update flag is set
    if (updateFlag) {
      writeFileSync(baselinePath, screenshot)
      return true
    }
    // otherwise report failure
    const ratio = (diffCount / totalPixels * 100).toFixed(2)
    const message = `Screenshot mismatch: ${diffCount} pixels differ (${ratio}%), allowed ${maxAllowed}. Actual saved to: ${currentPath}`
    await reportMismatch(screenshotFile, message, baseline, screenshot)
    expect.fail(message)
  }

  return true
}

// pass the baseline/actual pair to the Nuxt Spec HTML reporter via Vitest test artifacts
// best-effort only - it must never mask the actual assertion failure
async function reportMismatch(fileName: string, message: string, baseline: Uint8Array, actual: Uint8Array): Promise<void> {
  // undefined when called outside of a running test (e.g. in `beforeAll`)
  const test = TestRunner.getCurrentTest()
  if (!test) return

  try {
    await recordArtifact(test, {
      type: 'nuxt-spec:screenshot',
      fileName,
      message,
      attachments: [
        { name: 'baseline', contentType: 'image/png', body: baseline },
        { name: 'actual', contentType: 'image/png', body: actual },
      ],
    })
  } catch {
    // reporting is optional
  }
}
