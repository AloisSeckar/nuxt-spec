// internal unit tests for "/config/index.mjs"
// with `spec` options coming from (mocked) nuxt.config.ts

import { afterEach, describe, expect, test, vi } from 'vitest'
import { loadVitestConfig } from '../../config/index.mjs'

vi.mock('nuxt/kit', () => ({
  loadNuxtConfig: async () => ({
    spec: {
      externalPlaywright: 'ws://config:3000/',
      htmlReport: { enabled: false },
    },
  }),
}))

type TestProject = { test?: { name?: string, setupFiles?: string[], provide?: Record<string, unknown> } }

// `nuxt` project is skipped as it starts Nuxt instance which is not needed here
// (cast works around TS inferring `projects` as boolean from the .mjs source)
async function loadConfig() {
  return loadVitestConfig({}, { nuxt: false, browser: false } as unknown as boolean)
}

function e2eProject(config: Awaited<ReturnType<typeof loadVitestConfig>>): TestProject | undefined {
  return (config.test?.projects as TestProject[]).find(p => p?.test?.name === 'e2e')
}

function pluginNames(config: Awaited<ReturnType<typeof loadVitestConfig>>): string[] {
  return ((config.plugins ?? []) as unknown[]).flat(Infinity)
    .map(p => (p as { name?: string } | null)?.name)
    .filter((n): n is string => typeof n === 'string')
}

describe('Test `loadVitestConfig` with `spec` options', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('should apply `spec` options from nuxt.config', async () => {
    vi.stubEnv('NUXT_SPEC_HTML_REPORT', undefined)
    vi.stubEnv('NUXT_SPEC_EXTERNAL_PLAYWRIGHT', undefined)
    const config = await loadConfig()
    expect(pluginNames(config)).not.toContain('nuxt-spec:html-report')
    const e2e = e2eProject(config)
    expect(e2e?.test?.setupFiles?.[0]).toMatch(/utils[\\/]playwright\.ts$/)
    expect(e2e?.test?.provide).toEqual({ nuxtSpecExternalPlaywright: 'ws://config:3000/' })
  })

  test('should prefer env variables over `spec` options', async () => {
    vi.stubEnv('NUXT_SPEC_HTML_REPORT', 'true')
    vi.stubEnv('NUXT_SPEC_EXTERNAL_PLAYWRIGHT', 'ws://env:3000/')
    const config = await loadConfig()
    expect(pluginNames(config)).toContain('nuxt-spec:html-report')
    expect(e2eProject(config)?.test?.provide).toEqual({ nuxtSpecExternalPlaywright: 'ws://env:3000/' })
  })
})
