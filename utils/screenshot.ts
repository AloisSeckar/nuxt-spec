import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { NuxtPage } from '@nuxt/test-utils'
import { expect } from 'vitest'

export async function compareScreenshot(page: NuxtPage, options?: { fileName?: string, targetDir?: string, selector?: string }): Promise<boolean> {
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

  // @ts-expect-error - this is reliable way of reading Vitest "update" flag
  const updating = expect.getState().snapshotState?._updateSnapshot === 'all'
  if (updating || !existsSync(baselinePath)) {
    // save new baseline screenshot
    mkdirSync(baselineDir, { recursive: true })
    writeFileSync(baselinePath, screenshot)
    return true
  }

  // compare against stored baseline PNG
  const baseline = readFileSync(baselinePath)
  if (!screenshot.equals(baseline)) {
    // save what the test actually saw for debugging
    mkdirSync(currentDir, { recursive: true })
    const actualPath = resolve(currentDir, fileName)
    writeFileSync(actualPath, screenshot)
    expect.fail(`Screenshot mismatch. Actual result saved to: ${actualPath}`)
  }

  return true
}
