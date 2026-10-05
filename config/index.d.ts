import type { UserConfig } from 'vite'
import type { TestUserConfig } from 'vitest/config'

export type { HtmlReportOpenMode, NuxtSpecOptions } from './utils/options.mjs'

/** Typed Vite configuration object for tests */
type ExtendedUserConfig = UserConfig & {
  test?: TestUserConfig
}

/**
 * Allows fine-grained control over default Vitest `projects`.
 *
 * By default, everything is included.
 * If set to `false`, `test.projects` key is not merged at all.
 * If set to object, specific projects can be omitted by setting respective key to `false`.
 */
type ProjectsConfig = boolean | {
  default?: boolean
  unit?: boolean
  nuxt?: boolean
  e2e?: boolean
  browser?: boolean
}

/**
 * Prepare Vitest configuration object - user config merged with nuxt-spec defaults
 * (defaults are adjusted by `spec` key from nuxt.config.ts and NUXT_SPEC_* env variables)
 * @param userVitestConfig - custom Vitest config passed from the user
 * @param projects - allows fine-grained control over default `test.projects` - see `ProjectsConfig` for details
 * @returns Promise resolving to defu-merged Vitest configuration
 */
export declare function loadVitestConfig(
  userVitestConfig: ExtendedUserConfig,
  projects?: ProjectsConfig,
): Promise<ExtendedUserConfig>
