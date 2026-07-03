// this is the default Vitest config object
// based on https://nuxt.com/docs/4.x/getting-started/testing#setup
// `projects=false` can be used to suspend the default usage of "projects" in Vitest config

import { availableParallelism } from 'node:os'
import { fileURLToPath } from 'node:url'
import { onConsoleLog } from './utils/warnings.mjs' // filter out unnecessary logs
import { mergeConfig } from './utils/merge.mjs' // defu-based merge function
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { playwright } from '@vitest/browser-playwright'
import vue from '@vitejs/plugin-vue'

// absolute path so it works from nuxt-ignis package
const screenshotReportSetup = fileURLToPath(new URL('../utils/screenshot.ts', import.meta.url))

export async function loadVitestConfig(userVitestConfig, projects = true) {
  const baseConfig = {
    test: {
      // filter-out unnecessary console logs coming from Vitest
      // when the import is resolved, unnecessary stderr logs are also filtered-out
      // as a side-effect
      onConsoleLog,
      // Vitest defaults to 5 which might be unnecessarily restrictive
      // if the host machine can support more
      maxConcurrency: availableParallelism() / 2,
    },
  }

  if (projects === true) {
    baseConfig.test.projects = [
      // default fallback to catch tests directly in /test folder
      {
        extends: true,
        test: {
          name: 'default',
          include: ['{test,tests}/**/*.{test,spec}.ts', '!test/{browser,e2e,nuxt,unit}/**'],
          environment: 'node',
        },
      },
      // proposed setup for Unit tests
      {
        extends: true,
        test: {
          name: 'node',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      // proposed setup for Nuxt component tests
      await defineVitestProject({
        extends: true,
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
      // proposed setup for classic E2E tests (node-based, using @nuxt/test-utils)
      {
        extends: true,
        test: {
          name: 'e2e',
          include: ['test/e2e/**/*.{test,spec}.ts'],
          environment: 'node',
          // create report file for visual regression testing
          globalSetup: [screenshotReportSetup],
        },
      },
      // proposed setup for browser component tests (with Playwright runner)
      {
        extends: true,
        // vue plugin is required for proper imports resolution
        plugins: [vue()],
        test: {
          name: 'browser',
          include: ['test/browser/**/*.{test,spec}.ts'],
          environment: 'node',
          // only chromium browser - add others manually if needed
          browser: {
            provider: playwright(),
            enabled: true,
            headless: true,
            instances: [{
              browser: 'chromium',
              viewport: { width: 1280, height: 720 },
            }],
          },
        },
      },
    ]
  }

  return mergeConfig(userVitestConfig, defineConfig(baseConfig))
}
