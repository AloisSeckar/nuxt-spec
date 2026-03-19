import type { NuxtPage } from '@nuxt/test-utils'

/**
 * Visit a specified URL and return the page instance for further interaction.
 *
 * @param pageName - Path segment appended to the base URL (e.g. `'about'` → `/<about>`)
 * @returns Playwright page instance after navigation and hydration
 */
export declare function gotoPage(pageName: string): Promise<NuxtPage>

/**
 * Extract inner HTML content from a specified element on a given page.
 *
 * @param page - Playwright page instance, or a page name string (will call `gotoPage` internally)
 * @param element - CSS selector identifying the target element
 * @returns The inner HTML of the matched element
 */
export declare function getDataHtml(page: NuxtPage | string, element: string): Promise<string>

/**
 * Execute an API call by clicking a trigger element, wait for a successful
 * response matching the target URL, then extract the inner HTML from the
 * response element.
 *
 * @param page - Playwright page instance, or a page name string (will call `gotoPage` internally)
 * @param triggerElement - CSS selector for the clickable element that triggers the API request
 * @param targetUrl - Substring matched against the response URL to identify the expected API call
 * @param responseElement - CSS selector for the element displaying the API response
 * @returns The inner HTML of the response element
 */
export declare function getAPIResultHtml(
  page: NuxtPage | string,
  triggerElement: string,
  targetUrl: string,
  responseElement: string,
): Promise<string>

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
 * @param options - extra options (see `CompareScreenshotOptions`)
 * @returns `true` when the screenshot matches the baseline (or a new baseline was saved)
 * @throws Fails the current Vitest test when a mismatch is detected
 */
export declare function compareScreenshot(
  page: NuxtPage,
  options?: CompareScreenshotOptions,
): Promise<boolean>
