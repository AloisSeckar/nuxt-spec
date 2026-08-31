// Vitest setup file for the `e2e` project
// allows connecting to an external Playwright instance,
// if NUXT_SPEC_EXTERNAL_PLAYWRIGHT is set

import { chromium, firefox, webkit } from 'playwright-core'
import type { Browser, BrowserType } from 'playwright-core'

const wsEndpoint = process.env.NUXT_SPEC_EXTERNAL_PLAYWRIGHT

if (wsEndpoint) {
  for (const browserType of [chromium, firefox, webkit] as BrowserType[]) {
    // @nuxt/test-utils always calls `playwright[type].launch()` with no way to opt into
    // `connect()`, so the launch method is swapped for a connect against the WS endpoint
    browserType.launch = (): Promise<Browser> => browserType.connect(wsEndpoint, {
      // this allows reaching caller's localhost from within the external Playwright
      exposeNetwork: '<loopback>',
    })
  }
}
