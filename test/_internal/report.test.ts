// internal unit tests for "/config/utils/reporter.mjs"

import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  addReporter,
  collectReportData,
  formatSummary,
  NuxtSpecHtmlReporter,
  nuxtSpecReportPlugin,
  renderReport,
  shouldOpenReport,
  SCREENSHOT_ARTIFACT_TYPE,
} from '../../config/utils/reporter.mjs'

const ROOT = '/project'

type FakeTest = {
  name: string
  state: 'passed' | 'failed' | 'skipped'
  errors?: Array<{ name?: string, message: string, stack?: string, diff?: string }>
  artifacts?: unknown[]
}

// minimal stand-in for Vitest `TestModule` reported entity
function fakeModule(file: string, tests: FakeTest[], options: { project?: string, errors?: unknown[], suiteErrors?: unknown[] } = {}) {
  const testCases = tests.map(t => ({
    name: t.name,
    fullName: `Suite > ${t.name}`,
    result: () => ({ state: t.state, errors: t.errors }),
    artifacts: () => t.artifacts ?? [],
  }))
  const suites = options.suiteErrors
    ? [{ name: 'Suite', fullName: 'Suite', errors: () => options.suiteErrors }]
    : []
  return {
    project: { name: options.project ?? 'unit' },
    moduleId: `${ROOT}/${file}`,
    errors: () => options.errors ?? [],
    children: {
      allTests: () => testCases[Symbol.iterator](),
      allSuites: () => suites[Symbol.iterator](),
    },
  }
}

const PNG_BASE64 = 'iVBORw0KGgo='

describe('Test `collectReportData` function', () => {
  test('should count passed, failed and skipped tests', () => {
    const data = collectReportData([
      fakeModule('test/unit/a.test.ts', [
        { name: 'ok', state: 'passed' },
        { name: 'skip', state: 'skipped' },
        { name: 'ko', state: 'failed', errors: [{ message: 'boom' }] },
      ]),
    ], [], 'failed', ROOT)

    expect(data.total).toBe(2)
    expect(data.passed).toBe(1)
    expect(data.failed).toBe(1)
    expect(data.skipped).toBe(1)
    expect(data.hasFailure).toBe(true)
    expect(data.failures).toHaveLength(1)
    expect(data.failures[0]).toMatchObject({ project: 'unit', file: 'test/unit/a.test.ts', name: 'Suite > ko' })
  })

  test('should report no failure for an all-green run', () => {
    const data = collectReportData([
      fakeModule('test/unit/a.test.ts', [{ name: 'ok', state: 'passed' }]),
    ], [], 'passed', ROOT)
    expect(data.hasFailure).toBe(false)
    expect(data.failures).toHaveLength(0)
  })

  test('should treat module, suite and unhandled errors as failures', () => {
    expect(collectReportData([fakeModule('a.test.ts', [], { errors: [{ message: 'syntax' }] })], [], 'failed', ROOT).hasFailure).toBe(true)
    expect(collectReportData([fakeModule('a.test.ts', [], { suiteErrors: [{ message: 'hook' }] })], [], 'failed', ROOT).moduleErrors[0]?.suite).toBe('Suite')
    expect(collectReportData([], [{ message: 'unhandled' }], 'failed', ROOT).hasFailure).toBe(true)
  })

  test('should treat interrupted run as failure', () => {
    const data = collectReportData([fakeModule('a.test.ts', [{ name: 'ok', state: 'passed' }])], [], 'interrupted', ROOT)
    expect(data.hasFailure).toBe(true)
  })

  test('should strip ANSI codes from errors', () => {
    const data = collectReportData([
      fakeModule('a.test.ts', [{ name: 'ko', state: 'failed', errors: [{ message: '\u001B[31mred\u001B[39m', diff: '\u001B[32m- a\u001B[39m' }] }]),
    ], [], 'failed', ROOT)
    expect(data.failures[0]?.errors[0]?.message).toBe('red')
    expect(data.failures[0]?.errors[0]?.diff).toBe('- a')
  })

  test('should collect only Nuxt Spec screenshot artifacts', () => {
    const data = collectReportData([
      fakeModule('a.test.ts', [{
        name: 'ko',
        state: 'failed',
        errors: [{ message: 'mismatch' }],
        artifacts: [
          { type: 'internal:annotation' },
          {
            type: SCREENSHOT_ARTIFACT_TYPE,
            fileName: 'home.png',
            message: 'Screenshot mismatch',
            attachments: [
              { name: 'baseline', contentType: 'image/png', body: PNG_BASE64 },
              { name: 'actual', contentType: 'image/png', body: PNG_BASE64 },
            ],
          },
        ],
      }]),
    ], [], 'failed', ROOT)
    const screenshots = data.failures[0]?.screenshots
    expect(screenshots).toHaveLength(1)
    expect(screenshots?.[0]).toMatchObject({
      fileName: 'home.png',
      baselineUri: `data:image/png;base64,${PNG_BASE64}`,
      actualUri: `data:image/png;base64,${PNG_BASE64}`,
    })
  })

  test('should reject unsafe attachment payloads', () => {
    const data = collectReportData([
      fakeModule('a.test.ts', [{
        name: 'ko',
        state: 'failed',
        artifacts: [{
          type: SCREENSHOT_ARTIFACT_TYPE,
          fileName: 'x.png',
          message: 'm',
          attachments: [
            { name: 'baseline', contentType: 'text/html', body: '"><script>alert(1)</script>' },
            { name: 'actual', contentType: 'text/html" onerror="x', body: PNG_BASE64 },
          ],
        }],
      }]),
    ], [], 'failed', ROOT)
    const screenshot = data.failures[0]?.screenshots[0]
    expect(screenshot?.baselineUri).toBeUndefined()
    expect(screenshot?.actualUri).toBe(`data:image/png;base64,${PNG_BASE64}`)
  })
})

describe('Test `formatSummary` function', () => {
  const base: Parameters<typeof formatSummary>[0] = { total: 0, passed: 0, failed: 0, skipped: 0, reason: 'passed', moduleErrors: [], unhandledErrors: [], failures: [], hasFailure: false }

  test('should only state passed tests for green run', () => {
    expect(formatSummary({ ...base, total: 5, passed: 5 })).toBe('5/5 tests passed')
  })

  test('should list failed and skipped tests', () => {
    expect(formatSummary({ ...base, total: 5, passed: 3, failed: 2, skipped: 1, reason: 'failed', hasFailure: true }))
      .toBe('3/5 tests passed, 2 failed, 1 skipped')
  })

  test('should mention interrupted run', () => {
    expect(formatSummary({ ...base, total: 1, passed: 1, reason: 'interrupted', hasFailure: true }))
      .toBe('1/1 tests passed (test run was interrupted)')
  })
})

describe('Test `renderReport` function', () => {
  test('should render only summary for green run', () => {
    const data = collectReportData([fakeModule('a.test.ts', [{ name: 'ok', state: 'passed' }])], [], 'passed', ROOT)
    const html = renderReport(data, '2026-01-01 10:00:00', 'footer-time')
    expect(html).toContain('<p class="summary passed">1/1 tests passed</p>')
    expect(html).not.toContain('class="failure"')
    expect(html).toContain('2026-01-01 10:00:00')
    expect(html).toContain('footer-time')
    expect(html).not.toMatch(/\{\{\w+\}\}/)
  })

  test('should render failure details with escaping', () => {
    const data = collectReportData([
      fakeModule('a.test.ts', [{
        name: '<b>ko</b>',
        state: 'failed',
        errors: [{ name: 'AssertionError', message: 'expected <div> to be $& \'x\'', diff: '- a\n+ b', stack: 'at <anonymous>' }],
        artifacts: [{
          type: SCREENSHOT_ARTIFACT_TYPE,
          fileName: 'home.png',
          message: 'Screenshot mismatch',
          attachments: [
            { name: 'baseline', contentType: 'image/png', body: PNG_BASE64 },
            { name: 'actual', contentType: 'image/png', body: PNG_BASE64 },
          ],
        }],
      }], { project: 'e2e' }),
    ], [{ message: 'oops' }], 'failed', ROOT)
    const html = renderReport(data, 't', 'f')

    expect(html).toContain('<p class="summary failed">')
    expect(html).toContain('Suite &gt; &lt;b&gt;ko&lt;/b&gt;')
    expect(html).toContain('[e2e] a.test.ts')
    expect(html).toContain('AssertionError: expected &lt;div&gt; to be $&amp; &#39;x&#39;')
    expect(html).toContain('- a\n+ b')
    expect(html).toContain('at &lt;anonymous&gt;')
    expect(html).toContain('<h3>home.png</h3>')
    expect(html).toContain(`src="data:image/png;base64,${PNG_BASE64}"`)
    expect(html).toContain('Unhandled error')
    expect(html).not.toContain('<b>ko</b>')
    expect(html).not.toMatch(/\{\{\w+\}\}/)
  })
})

describe('Test `shouldOpenReport` function', () => {
  test('should open only on failure by default', () => {
    expect(shouldOpenReport({ mode: undefined, hasFailure: true, ci: false, watch: false })).toBe(true)
    expect(shouldOpenReport({ mode: undefined, hasFailure: false, ci: false, watch: false })).toBe(false)
  })

  test('should respect `always` and `never` modes', () => {
    expect(shouldOpenReport({ mode: 'always', hasFailure: false, ci: false, watch: false })).toBe(true)
    expect(shouldOpenReport({ mode: 'NEVER', hasFailure: true, ci: false, watch: false })).toBe(false)
  })

  test('should fall back to `on-failure` for invalid mode', () => {
    expect(shouldOpenReport({ mode: 'sometimes', hasFailure: false, ci: false, watch: false })).toBe(false)
    expect(shouldOpenReport({ mode: 'sometimes', hasFailure: true, ci: false, watch: false })).toBe(true)
  })

  test('should never open in CI or watch mode', () => {
    expect(shouldOpenReport({ mode: 'always', hasFailure: true, ci: true, watch: false })).toBe(false)
    expect(shouldOpenReport({ mode: 'always', hasFailure: true, ci: false, watch: true })).toBe(false)
  })
})

describe('Test HTML report plugin', () => {
  test('should append reporter to any existing reporters', () => {
    const config = { reporters: [['dot', {}], ['json', { outputFile: 'x.json' }]] as unknown[] }
    addReporter(config)
    expect(config.reporters).toHaveLength(3)
    expect(config.reporters[0]).toEqual(['dot', {}])
    expect(config.reporters[2]).toBeInstanceOf(NuxtSpecHtmlReporter)
  })

  test('should add reporter only once across multiple project hooks', () => {
    const vitest = { config: { reporters: [['default', {}]] as unknown[] } }
    const plugin = nuxtSpecReportPlugin()
    plugin.configureVitest({ vitest })
    plugin.configureVitest({ vitest })
    nuxtSpecReportPlugin().configureVitest({ vitest })
    expect(vitest.config.reporters.filter(r => r instanceof NuxtSpecHtmlReporter)).toHaveLength(1)
  })

  test('should create reporters array if missing', () => {
    const config: { reporters?: unknown[] } = {}
    addReporter(config)
    expect(config.reporters).toHaveLength(1)
  })
})

describe('Test `NuxtSpecHtmlReporter` output', () => {
  test('should write timestamped report file into `test/__reports__`', () => {
    const root = mkdtempSync(join(tmpdir(), 'nuxt-spec-report-'))
    try {
      const logs: string[] = []
      const reporter = new NuxtSpecHtmlReporter()
      // watch mode prevents opening browser
      reporter.onInit({ config: { root, watch: true }, logger: { log: (msg: string) => logs.push(msg) } })
      reporter.onTestRunStart()
      reporter.onTestRunEnd([fakeModule('a.test.ts', [{ name: 'ok', state: 'passed' }])], [], 'passed')

      const reportDir = join(root, 'test', '__reports__')
      expect(existsSync(reportDir)).toBe(true)
      const files = readdirSync(reportDir)
      expect(files).toHaveLength(1)
      expect(files[0]).toMatch(/^report-\d{14}\.html$/)
      expect(readFileSync(join(reportDir, files[0]!), 'utf-8')).toContain('1/1 tests passed')
      expect(logs.join('\n')).toContain('Test report available at')
      expect(logs.join('\n')).not.toContain('Opening report')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
