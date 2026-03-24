// custom visual regression test using @nuxt/test-utils + Playwright
// starts a real Nuxt application instance and captures screenshots
// WIP - currently only capable of doing custom screenshot,
//       not using the built-in snapshot testing of Vitest

import { setup, createPage, url } from '@nuxt/test-utils/e2e'
import { describe, expect, test } from 'vitest'
import { compareScreenshot } from 'nuxt-spec/utils'

describe('Visual Regression', async () => {
  // start the Nuxt application
  await setup()

  test('home page matches screenshot - custom', async () => {
    // open a real browser page and navigate to the running Nuxt app
    const page = await createPage()
    await page.setViewportSize({ width: 1280, height: 720 }) // important for consistent results!
    await page.goto(url('/'), { waitUntil: 'networkidle' })

    // maxDiffPixels or maxDiffPixelRatio can be set to mitigate cross-platform rendering differences

    // no fileName specified - will use route as filename (or "index" for "/") (1% difference allowed)
    expect(await compareScreenshot(page, { maxDiffPixelRatio: 0.01 })).toEqual(true)

    // file name can be specified explicitly (1% difference allowed)
    expect(await compareScreenshot(page, { fileName: 'homepage.png', maxDiffPixelRatio: 0.01 })).toEqual(true)

    // only capture a specific element with selector (300 different pixels allowed)
    expect(await compareScreenshot(page, { fileName: 'component.png', selector: 'h1', maxDiffPixels: 300 })).toEqual(true)
  })
})
