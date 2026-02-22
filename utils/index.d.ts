import type { NuxtPage } from '@nuxt/test-utils'

/**
 * Capture a full-page screenshot and compare it against a stored baseline PNG.
 * When run with `-u` / `--update`, or when no baseline exists yet, the current
 * screenshot is saved as the new baseline.
 *
 * @param page - Playwright page instance obtained from `createPage()`
 * @param fileName - Name of the PNG file used for baseline storage and comparison
 * @param targetDir - Directory for baseline/current screenshots, relative to project root (defaults to `test/e2e`)
 * @returns `true` when the screenshot matches the baseline (or a new baseline was saved)
 * @throws Fails the current Vitest test when a mismatch is detected
 */
export declare function compareScrenshot(
  page: NuxtPage,
  fileName: string,
  targetDir?: string,
): Promise<boolean>
