// custom visual regression test using @nuxt/test-utils + Playwright
// starts a real Nuxt application instance and captures screenshots
// WIP - currently only capable of doing custom screenshot,
//       not using the built-in snapshot testing of Vitest

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setup, createPage, url } from '@nuxt/test-utils/e2e'
import { describe, expect, test } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))
const baselineDir = resolve(dir, '__baseline__')
const currentDir = resolve(dir, '__current__')
const updating = process.argv.includes('-u') || process.argv.includes('--update')

describe('Visual Regression', async () => {
  // start the Nuxt application
  await setup()

  test('home page matches screenshot - custom', async () => {
    // open a real browser page and navigate to the running Nuxt app
    const page = await createPage()
    await page.goto(url('/'), { waitUntil: 'networkidle' })

    // capture full-page screenshot as PNG
    const screenshot = await page.screenshot({ fullPage: true })
    const baselinePath = resolve(baselineDir, 'home-page.png')

    if (updating || !existsSync(baselinePath)) {
      // save new baseline screenshot
      mkdirSync(baselineDir, { recursive: true })
      writeFileSync(baselinePath, screenshot)
      return
    }

    // compare against stored baseline PNG
    const baseline = readFileSync(baselinePath)
    if (!screenshot.equals(baseline)) {
      // save what the test actually saw for debugging
      mkdirSync(currentDir, { recursive: true })
      const actualPath = resolve(currentDir, 'home-page.png')
      writeFileSync(actualPath, screenshot)
      expect.fail(`Screenshot mismatch. Actual result saved to: ${actualPath}`)
    }
  })
})
