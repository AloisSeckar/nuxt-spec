// this is the default Vitest config object
// based on https://nuxt.com/docs/4.x/getting-started/testing#setup

import { defu } from 'defu'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

// @ts-expect-error no-implicit-any
// TODO set proper type for the object
export async function loadVitestConfig(userVitestConfig) {
  return defu(userVitestConfig, defineConfig({
    test: {
      projects: [
        // default fallback to catch tests in /test folder
        {
          test: {
            name: 'node',
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
      ],
    },
  }))
}
