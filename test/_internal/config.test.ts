import { describe, expect, test } from 'vitest'
import { loadVitestConfig } from '../../config/index.mjs'

// TypeScript infers `projects` as `boolean` from the .mjs source instead of
// picking up the full ProjectsConfig from config/index.d.ts (because the .mjs
// file is listed in tsconfig `include`). Mirror the type here so tests can pass
// the object form without suppressing errors globally.
type ProjectsConfig = boolean | {
  default?: boolean
  node?: boolean
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
    expect(names).toContain('node')
    expect(names).toContain('nuxt')
    expect(names).toContain('e2e')
    expect(names).toContain('browser')
    expect(names).toHaveLength(5)
  })

  test('should exclude `default` project when `projects.default` is false', async () => {
    const config = await loadConfig({}, { default: false })
    const names = projectNames(config)
    expect(names).not.toContain('default')
    expect(names).toContain('node')
    expect(names).toContain('nuxt')
    expect(names).toContain('e2e')
    expect(names).toContain('browser')
  })

  test('should exclude `node` project when `projects.node` is false', async () => {
    const config = await loadConfig({}, { node: false })
    const names = projectNames(config)
    expect(names).not.toContain('node')
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
    expect(names).toContain('node')
    expect(names).toContain('e2e')
    expect(names).toContain('browser')
  })

  test('should exclude `e2e` project when `projects.e2e` is false', async () => {
    const config = await loadConfig({}, { e2e: false })
    const names = projectNames(config)
    expect(names).not.toContain('e2e')
    expect(names).toContain('default')
    expect(names).toContain('node')
    expect(names).toContain('nuxt')
    expect(names).toContain('browser')
  })

  test('should exclude `browser` project when `projects.browser` is false', async () => {
    const config = await loadConfig({}, { browser: false })
    const names = projectNames(config)
    expect(names).not.toContain('browser')
    expect(names).toContain('default')
    expect(names).toContain('node')
    expect(names).toContain('nuxt')
    expect(names).toContain('e2e')
  })

  test('should exclude multiple projects when several keys are false', async () => {
    const config = await loadConfig({}, { nuxt: false, browser: false })
    const names = projectNames(config)
    expect(names).not.toContain('nuxt')
    expect(names).not.toContain('browser')
    expect(names).toContain('default')
    expect(names).toContain('node')
    expect(names).toContain('e2e')
    expect(names).toHaveLength(3)
  })

  test('should result in an empty `projects` array when all projects are disabled', async () => {
    const config = await loadConfig({}, { default: false, node: false, nuxt: false, e2e: false, browser: false })
    expect(config.test?.projects).toBeDefined()
    expect(config.test?.projects).toHaveLength(0)
  })
})
