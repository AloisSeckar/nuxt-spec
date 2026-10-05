// internal unit tests for
// - "/config/utils/options.mjs"
// - "/modules/spec-options.ts"

import { afterEach, describe, expect, test, vi } from 'vitest'
import type { Nuxt } from 'nuxt/schema'
import { NUXT_SPEC_DEFAULTS, resolveSpecOptions } from '../../config/utils/options.mjs'
import specOptionsModule from '../../modules/spec-options'

describe('Test `resolveSpecOptions` function', () => {
  test('should return defaults when nothing is set', () => {
    expect(resolveSpecOptions(undefined, {})).toEqual(NUXT_SPEC_DEFAULTS)
    expect(resolveSpecOptions({}, {})).toEqual(NUXT_SPEC_DEFAULTS)
    expect(resolveSpecOptions(false, {})).toEqual(NUXT_SPEC_DEFAULTS)
    expect(resolveSpecOptions(null, {})).toEqual(NUXT_SPEC_DEFAULTS)
  })

  test('should use values from nuxt.config', () => {
    const options = resolveSpecOptions({
      hints: false,
      externalPlaywright: 'ws://config:3000/',
      htmlReport: { enabled: false, open: 'never' },
      messageFilters: ['config-filter'],
    }, {})
    expect(options).toEqual({
      hints: false,
      externalPlaywright: 'ws://config:3000/',
      htmlReport: { enabled: false, open: 'never' },
      messageFilters: ['config-filter'],
    })
  })

  test('should fill missing nested values with defaults', () => {
    const options = resolveSpecOptions({ htmlReport: { open: 'always' } }, {})
    expect(options.htmlReport).toEqual({ enabled: true, open: 'always' })
  })

  test('should prefer env variables over nuxt.config', () => {
    const options = resolveSpecOptions({
      hints: false,
      externalPlaywright: 'ws://config:3000/',
      htmlReport: { enabled: false, open: 'never' },
    }, {
      NUXT_SPEC_HINTS_ENABLED: 'true',
      NUXT_SPEC_EXTERNAL_PLAYWRIGHT: 'ws://env:3000/',
      NUXT_SPEC_HTML_REPORT: 'true',
      NUXT_SPEC_HTML_REPORT_OPEN: 'always',
    })
    expect(options.hints).toBe(true)
    expect(options.externalPlaywright).toBe('ws://env:3000/')
    expect(options.htmlReport).toEqual({ enabled: true, open: 'always' })
  })

  test('should only disable features with explicit `false` env value', () => {
    expect(resolveSpecOptions({}, { NUXT_SPEC_HINTS_ENABLED: 'false' }).hints).toBe(false)
    expect(resolveSpecOptions({}, { NUXT_SPEC_HTML_REPORT: 'false' }).htmlReport.enabled).toBe(false)
    expect(resolveSpecOptions({}, { NUXT_SPEC_HTML_REPORT: '0' }).htmlReport.enabled).toBe(true)
  })

  test('should ignore empty env variables', () => {
    const options = resolveSpecOptions({
      hints: false,
      externalPlaywright: 'ws://config:3000/',
      htmlReport: { enabled: false, open: 'never' },
    }, {
      NUXT_SPEC_HINTS_ENABLED: '',
      NUXT_SPEC_EXTERNAL_PLAYWRIGHT: '',
      NUXT_SPEC_HTML_REPORT: '',
      NUXT_SPEC_HTML_REPORT_OPEN: '',
    })
    expect(options.hints).toBe(false)
    expect(options.externalPlaywright).toBe('ws://config:3000/')
    expect(options.htmlReport).toEqual({ enabled: false, open: 'never' })
  })

  test('should concatenate message filters from nuxt.config and env', () => {
    const options = resolveSpecOptions(
      { messageFilters: ['config-1', ' config-2 '] },
      { NUXT_SPEC_MESSAGE_FILTERS: 'env-1, env-2' },
    )
    expect(options.messageFilters).toEqual(['config-1', 'config-2', 'env-1', 'env-2'])
  })

  test('should drop empty message filters', () => {
    const options = resolveSpecOptions(
      // @ts-expect-error intentional wrong type
      { messageFilters: ['', '  ', 42, 'valid'] },
      { NUXT_SPEC_MESSAGE_FILTERS: ',env,,' },
    )
    expect(options.messageFilters).toEqual(['valid', 'env'])
  })

  test('should not mutate defaults', () => {
    resolveSpecOptions({ messageFilters: ['x'] }, { NUXT_SPEC_MESSAGE_FILTERS: 'y' }).messageFilters.push('z')
    expect(NUXT_SPEC_DEFAULTS.messageFilters).toEqual([])
  })
})

describe('Test `spec-options` Nuxt module', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  const getDependencies = (spec?: unknown) =>
    specOptionsModule.getModuleDependencies?.({ options: { spec } } as unknown as Nuxt)

  test('should register `spec` config key', async () => {
    const meta = await specOptionsModule.getMeta?.()
    expect(meta?.configKey).toBe('spec')
  })

  test('should include @nuxt/hints by default', async () => {
    vi.stubEnv('NUXT_SPEC_HINTS_ENABLED', undefined)
    expect(await getDependencies()).toHaveProperty('@nuxt/hints')
  })

  test('should exclude @nuxt/hints when disabled in nuxt.config', async () => {
    vi.stubEnv('NUXT_SPEC_HINTS_ENABLED', undefined)
    expect(await getDependencies({ hints: false })).toEqual({})
  })

  test('should exclude @nuxt/hints when disabled via env', async () => {
    vi.stubEnv('NUXT_SPEC_HINTS_ENABLED', 'false')
    expect(await getDependencies({ hints: true })).toEqual({})
  })
})
