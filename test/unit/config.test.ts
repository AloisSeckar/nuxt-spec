import { describe, expect, test } from 'vitest'
import { loadVitestConfig } from '../../config/index.ts'

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
})
