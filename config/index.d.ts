import type { UserConfig } from 'vite'

/**
 * Prepare Vitest configuration object - user config merged with nuxt-spec defaults
 * @param userVitestConfig - custom Vitest config passed from the user
 * @param projects - can be used to suspend the default inclusion of "projects" in Vitest config
 * @returns Promise resolving to defu-merged Vitest configuration
 */
export declare function loadVitestConfig(
  userVitestConfig: UserConfig,
  projects?: boolean,
): Promise<UserConfig>
