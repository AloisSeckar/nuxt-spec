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
    await page.goto(url('/'), { waitUntil: 'networkidle' })

    // no options - will use route as filename (or "index" for "/")
    expect(await compareScreenshot(page)).toEqual(true)
    // file name can be specified explicitly
    expect(await compareScreenshot(page, { fileName: 'homepage.png' })).toEqual(true)

    // only capture a specific element
    expect(await compareScreenshot(page, { fileName: 'component.png', selector: '#test' })).toEqual(true)
  })
})
