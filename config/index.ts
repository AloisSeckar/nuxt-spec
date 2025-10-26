// this is the default Vitest config object
// based on https://nuxt.com/docs/4.x/getting-started/testing#setup

import { defu } from 'defu'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import type { UserConfig } from 'vite'

/**
 * Prepare Vitest configuration object - user config merged with nuxt-spec defaults
 * @param userVitestConfig - custom Vitest config passed from the user
 * @param projects - can be used to suspend the default inclusion of "projects" in Vitest config
 * @returns Promise resolving to defu-merged Vitest configuration
 */
export async function loadVitestConfig(
  userVitestConfig: UserConfig,
  projects: boolean = true,
): Promise<UserConfig> {
  const baseConfig: UserConfig = {
    test: {},
  }

  if (projects === true) {
    baseConfig.test!.projects = [
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
