import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { NuxtPage } from '@nuxt/test-utils'
import { expect } from 'vitest'

export async function compareScrenshot(page: NuxtPage, fileName: string, targetDir?: string): Promise<boolean> {
  const dir = resolve(process.cwd(), targetDir ?? 'test/e2e')
  const baselineDir = resolve(dir, '__baseline__')
  const currentDir = resolve(dir, '__current__')

  // capture full-page screenshot as PNG
  const screenshot = await page.screenshot({ fullPage: true })
  const baselinePath = resolve(baselineDir, fileName)

  const updating = process.argv.includes('-u') || process.argv.includes('--update')
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
