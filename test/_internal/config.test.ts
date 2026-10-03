import { describe, expect, test, vi } from 'vitest'
import { loadVitestConfig } from '../../config/index.mjs'

// TypeScript infers `projects` as `boolean` from the .mjs source instead of
// picking up the full ProjectsConfig from config/index.d.ts (because the .mjs
// file is listed in tsconfig `include`). Mirror the type here so tests can pass
// the object form without suppressing errors globally.
type ProjectsConfig = boolean | {
  default?: boolean
  unit?: boolean
  nuxt?: boolean
  e2e?: boolean
  browser?: boolean
}

// Wrapper that accepts the full ProjectsConfig union, working around TS inference.
function loadConfig(
  userConfig: Parameters<typeof loadVitestConfig>[0],
  projects?: ProjectsConfig,
): ReturnType<typeof loadVitestConfig> {
  return loadVitestConfig(userConfig, projects as unknown as boolean)
}

/** Extract the `test.name` values from the resolved projects array. */
function projectNames(config: Awaited<ReturnType<typeof loadVitestConfig>>): string[] {
  return ((config.test?.projects as Array<{ test?: { name?: string } }>) ?? [])
    .map(p => p?.test?.name)
    .filter((n): n is string => typeof n === 'string')
}

/** Extract the names of root-level Vite plugins. */
function pluginNames(config: Awaited<ReturnType<typeof loadVitestConfig>>): string[] {
  return ((config.plugins ?? []) as unknown[]).flat(Infinity)
    .map(p => (p as { name?: string } | null)?.name)
    .filter((n): n is string => typeof n === 'string')
}

describe('Test `loadVitestConfig` function', () => {
  test('should be defined', () => {
    expect(loadVitestConfig).toBeDefined()
  })

  test('should include `projects` by default', async () => {
    const config = await loadVitestConfig({})
    expect(config.test?.projects).toBeDefined()
  }, 10000) // first test needs more time

  test('should exclude `projects` upon request', async () => {
    const config = await loadVitestConfig({}, false)
    expect(config.test?.projects).toBeUndefined()
  })

  test('should merge custom config with defaults', async () => {
    const config = await loadVitestConfig({ test: { ui: true } })
    // custom config should be added
    expect(config.test?.ui).toBeDefined()
    expect(config.test?.ui).toBe(true)
    // defaults should be preserved
    expect(config.test?.projects).toBeDefined()
  })

  test('should merge custom config with defaults but exclude `projects` upon request', async () => {
    const config = await loadVitestConfig({ test: { ui: false } }, false)
    // custom config should be added
    expect(config.test?.ui).toBeDefined()
    expect(config.test?.ui).toBe(false)
    // defaults should be preserved
    expect(config.test?.projects).toBeUndefined()
  })

  // test the `projects` config object

  test('should include all five projects when `projects` is an empty object', async () => {
    const config = await loadConfig({}, {})
    const names = projectNames(config)
    expect(names).toContain('default')
    expect(names).toContain('unit')
    expect(names).toContain('nuxt')
    expect(names).toContain('e2e')
    expect(names).toContain('browser')
    expect(names).toHaveLength(5)
  })

  test('should exclude `default` project when `projects.default` is false', async () => {
    const config = await loadConfig({}, { default: false })
    const names = projectNames(config)
    expect(names).not.toContain('default')
    expect(names).toContain('unit')
    expect(names).toContain('nuxt')
    expect(names).toContain('e2e')
    expect(names).toContain('browser')
  })

  test('should exclude `unit` project when `projects.unit` is false', async () => {
    const config = await loadConfig({}, { unit: false })
    const names = projectNames(config)
    expect(names).not.toContain('unit')
    expect(names).toContain('default')
    expect(names).toContain('nuxt')
    expect(names).toContain('e2e')
    expect(names).toContain('browser')
  })

  test('should exclude `nuxt` project when `projects.nuxt` is false', async () => {
    const config = await loadConfig({}, { nuxt: false })
    const names = projectNames(config)
    expect(names).not.toContain('nuxt')
    expect(names).toContain('default')
    expect(names).toContain('unit')
    expect(names).toContain('e2e')
    expect(names).toContain('browser')
  })

  test('should exclude `e2e` project when `projects.e2e` is false', async () => {
    const config = await loadConfig({}, { e2e: false })
    const names = projectNames(config)
    expect(names).not.toContain('e2e')
    expect(names).toContain('default')
    expect(names).toContain('unit')
    expect(names).toContain('nuxt')
    expect(names).toContain('browser')
  })

  test('should exclude `browser` project when `projects.browser` is false', async () => {
    const config = await loadConfig({}, { browser: false })
    const names = projectNames(config)
    expect(names).not.toContain('browser')
    expect(names).toContain('default')
    expect(names).toContain('unit')
    expect(names).toContain('nuxt')
    expect(names).toContain('e2e')
  })

  test('should exclude multiple projects when several keys are false', async () => {
    const config = await loadConfig({}, { nuxt: false, browser: false })
    const names = projectNames(config)
    expect(names).not.toContain('nuxt')
    expect(names).not.toContain('browser')
    expect(names).toContain('default')
    expect(names).toContain('unit')
    expect(names).toContain('e2e')
    expect(names).toHaveLength(3)
  })

  test('should result in an empty `projects` array when all projects are disabled', async () => {
    const config = await loadConfig({}, { default: false, unit: false, nuxt: false, e2e: false, browser: false })
    expect(config.test?.projects).toBeDefined()
    expect(config.test?.projects).toHaveLength(0)
  })

  // HTML report plugin

  test('should include HTML report plugin by default', async () => {
    const config = await loadVitestConfig({})
    expect(pluginNames(config)).toContain('nuxt-spec:html-report')
  })

  test('should include HTML report plugin when `projects` are excluded', async () => {
    const config = await loadVitestConfig({}, false)
    expect(pluginNames(config)).toContain('nuxt-spec:html-report')
  })

  test('should keep user-defined plugins alongside HTML report plugin', async () => {
    const config = await loadVitestConfig({ plugins: [{ name: 'user-plugin' }] })
    const names = pluginNames(config)
    expect(names).toContain('user-plugin')
    expect(names).toContain('nuxt-spec:html-report')
  })

  test('should not touch `reporters` setting', async () => {
    const config = await loadVitestConfig({})
    expect(config.test?.reporters).toBeUndefined()
  })

  test('should exclude HTML report plugin when NUXT_SPEC_HTML_REPORT=false', async () => {
    vi.stubEnv('NUXT_SPEC_HTML_REPORT', 'false')
    try {
      const config = await loadVitestConfig({})
      expect(pluginNames(config)).not.toContain('nuxt-spec:html-report')
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
