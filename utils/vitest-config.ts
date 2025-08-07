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
        {
          test: {
            name: 'node',
            include: ['test/{e2e,unit}/*.{test,spec}.ts'],
            environment: 'node',
          },
        },
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
