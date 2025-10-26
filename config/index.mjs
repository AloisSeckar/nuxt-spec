// this is the default Vitest config object
// based on https://nuxt.com/docs/4.x/getting-started/testing#setup
// `projects=false` can be used to suspend the default usage of "projects" in Vitest config

import { defu } from 'defu'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export async function loadVitestConfig(userVitestConfig, projects = true) {
  const baseConfig = {
    test: {},
  }

  if (projects === true) {
    baseConfig.test.projects = [
      // default fallback to catch tests in /test folder
      {
        test: {
          name: 'default',
          include: ['test/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      // proposed setup for unit and e2e tests
      {
        test: {
          name: 'node',
          include: ['test/{e2e,unit}/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      // proposed setup for Nuxt
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ]
  }

  return defu(userVitestConfig, defineConfig(baseConfig))
}
