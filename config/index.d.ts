import type { UserConfig } from 'vite'
import type { TestUserConfig } from 'vitest/config'

type ExtendedUserConfig = UserConfig & {
  test?: TestUserConfig
}

/**
 * Prepare Vitest configuration object - user config merged with nuxt-spec defaults
 * @param userVitestConfig - custom Vitest config passed from the user
 * @param projects - can be used to suspend the default inclusion of "projects" in Vitest config
 * @returns Promise resolving to defu-merged Vitest configuration
 */
export declare function loadVitestConfig(
  userVitestConfig: ExtendedUserConfig,
  projects?: boolean,
): Promise<ExtendedUserConfig>
