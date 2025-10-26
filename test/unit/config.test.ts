import { describe, expect, test } from 'vitest'
import { loadVitestConfig } from '../../config/index.mjs'

describe('Test `loadVitestConfig` function', () => {
  test('should be defined', () => {
    expect(loadVitestConfig).toBeDefined()
  })

  test('should include `projects` by default', async () => {
    const config = await loadVitestConfig({})
    expect(config.test.projects).toBeDefined()
  })

  test('should exclude `projects` upon request', async () => {
    const config = await loadVitestConfig({}, false)
    expect(config.test.projects).toBeUndefined()
  })

  test('should merge custom config with defaults', async () => {
    const config = await loadVitestConfig({ key: 'value' })
    // custom config should be added
    expect(config.key).toBeDefined()
    expect(config.key).toBe('value')
    // defaults should be preserved
    expect(config.test.projects).toBeDefined()
  })

  test('should merge custom config with defaults but exclude `projects` upon request', async () => {
    const config = await loadVitestConfig({ key: 'value' }, false)
    // custom config should be added
    expect(config.key).toBeDefined()
    expect(config.key).toBe('value')
    // defaults should be preserved
    expect(config.test.projects).toBeUndefined()
  })
})
