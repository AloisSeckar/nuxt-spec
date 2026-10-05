// Vitest setup file for the `e2e` project
// allows connecting to an external Playwright instance,
// if `spec.externalPlaywright` or NUXT_SPEC_EXTERNAL_PLAYWRIGHT is set

import { inject } from 'vitest'
import { chromium, firefox, webkit } from 'playwright-core'
import type { Browser, BrowserType } from 'playwright-core'

declare module 'vitest' {
  interface ProvidedContext {
    nuxtSpecExternalPlaywright?: string
  }
}

// resolved and provided by `loadVitestConfig` (config/index.mjs)
const externalPlaywright = inject('nuxtSpecExternalPlaywright')

if (externalPlaywright) {
  console.log(`[Nuxt Spec] Using external Playwright instance for e2e tests at: ${externalPlaywright}`)
  for (const browserType of [chromium, firefox, webkit] as BrowserType[]) {
    // @nuxt/test-utils always calls `playwright[type].launch()` with no way to opt into
    // `connect()`, so the launch method is swapped for a connect against the WS endpoint
    browserType.launch = (): Promise<Browser> => browserType.connect(externalPlaywright, {
      // this allows reaching caller's localhost from within the external Playwright
      exposeNetwork: '<loopback>',
    })
  }
}
