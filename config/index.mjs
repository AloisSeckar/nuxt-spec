// this is the default Vitest config object
// based on https://nuxt.com/docs/4.x/getting-started/testing#setup
// `projects=false` can be used to suspend the default usage of "projects" in Vitest config

import { mergeConfig } from './merge' // defu-based merge function
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { playwright } from '@vitest/browser-playwright'
import vue from '@vitejs/plugin-vue'

export async function loadVitestConfig(userVitestConfig, projects = true) {
  const baseConfig = {
    test: {},
  }

  if (projects === true) {
    baseConfig.test.projects = [
      // default fallback to catch tests directly in /test folder
      {
        test: {
          name: 'default',
          include: ['{test,tests}/**/*.{test,spec}.ts', '!test/{browser,e2e,nuxt,unit}/**'],
          environment: 'node',
        },
      },
      // proposed setup for Unit tests
      {
        test: {
          name: 'node',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      // proposed setup for Nuxt component tests
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
      // proposed setup for classic E2E tests (node-based, using @nuxt/test-utils)
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      // proposed setup for browser component tests (with Playwright runner)
      {
        // vue plugin is required for proper imports resolution
        plugins: [vue()],
        test: {
          name: 'browser',
          include: ['test/browser/**/*.{test,spec}.ts'],
          environment: 'node',
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
