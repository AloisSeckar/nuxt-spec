// HTML test report for Nuxt Spec
// - `NuxtSpecHtmlReporter` is a Vitest reporter that renders a self-contained HTML file
//   into `<root>/test/__reports__/report-YYYYMMDDHHMMSS.html` after each test run
// - `nuxtSpecReportPlugin` is a Vite plugin that appends the reporter to whatever reporters
//   are in effect (CLI `--reporter`, user config or Vitest defaults)
// - NUXT_SPEC_HTML_REPORT_OPEN=always|on-failure|never controls opening the report in browser

import { exec } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { platform } from 'node:os'
import { relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/** Artifact type recorded by `compareScreenshot` on mismatch */
export const SCREENSHOT_ARTIFACT_TYPE = 'nuxt-spec:screenshot'

/** Relative path (from Vitest root) where report files are stored */
export const REPORT_DIR = 'test/__reports__'

const OPEN_MODES = ['always', 'on-failure', 'never']

// marker used to identify the reporter instance even if this module is loaded more than once
const REPORTER_MARK = Symbol.for('nuxt-spec:html-reporter')

const templatesDir = fileURLToPath(new URL('../report/', import.meta.url))
const loadTemplate = name => readFileSync(resolve(templatesDir, name), 'utf-8')

/**
 * Vite plugin that registers `NuxtSpecHtmlReporter`.
 * The `configureVitest` hook runs after Vitest merged CLI and config reporters,
 * but before reporters are instantiated, so the HTML reporter is always appended.
 */
export function nuxtSpecReportPlugin() {
  return {
    name: 'nuxt-spec:html-report',
    configureVitest({ vitest }) {
      addReporter(vitest.config)
    },
  }
}

/**
 * Append the Nuxt Spec HTML reporter into resolved Vitest config.
 * The hook is called once per project, so duplicates must be avoided.
 * @param {{ reporters?: unknown[] }} config - resolved Vitest config
 */
export function addReporter(config) {
  config.reporters ??= []
  if (config.reporters.some(r => r?.[REPORTER_MARK])) return
  config.reporters.push(new NuxtSpecHtmlReporter())
}

export class NuxtSpecHtmlReporter {
  [REPORTER_MARK] = true

  onInit(vitest) {
    this.vitest = vitest
  }

  onTestRunStart() {
    this.startedAt = new Date()
  }

  onTestRunEnd(testModules, unhandledErrors, reason) {
    const startedAt = this.startedAt ?? new Date()
    const root = this.vitest?.config?.root ?? process.cwd()
    const watch = !!this.vitest?.config?.watch
    const log = (msg) => {
      if (this.vitest?.logger) this.vitest.logger.log(msg)
      else console.log(msg)
    }

    const data = collectReportData(testModules, unhandledErrors, reason, root)
    const html = renderReport(data, reportTimestamp(startedAt, true), new Date().toISOString())

    const reportDir = resolve(root, REPORT_DIR)
    const reportPath = resolve(reportDir, `report-${reportTimestamp(startedAt)}.html`)
    try {
      mkdirSync(reportDir, { recursive: true })
      writeFileSync(reportPath, html)
    } catch (error) {
      log(`\n(nuxt-spec) Failed to write HTML report: ${error?.message ?? error}`)
      return
    }

    log(`\n(nuxt-spec) Test report available at:\n${pathToFileURL(reportPath).href}`)

    const shouldOpen = shouldOpenReport({
      mode: process.env.NUXT_SPEC_HTML_REPORT_OPEN,
      hasFailure: data.hasFailure,
      ci: !!process.env.CI,
      watch,
    })
    if (shouldOpen) {
      log('(nuxt-spec) Opening report in default browser...')
      openInBrowser(reportPath, () => log('(nuxt-spec) Failed to automatically open report'))
    }
  }
}

/**
 * Decide whether the report should be opened in the default browser.
 * Never opens in CI or watch mode. Invalid `mode` falls back to `on-failure`.
 * @param {{ mode?: string, hasFailure: boolean, ci: boolean, watch: boolean }} options
 */
export function shouldOpenReport({ mode, hasFailure, ci, watch }) {
  if (ci || watch) return false
  const normalized = mode?.trim().toLowerCase() || 'on-failure'
  const effective = OPEN_MODES.includes(normalized) ? normalized : 'on-failure'
  if (effective === 'always') return true
  if (effective === 'never') return false
  return hasFailure
}

/**
 * @typedef {{ message: string, diff?: string, stack?: string }} ReportError
 * @typedef {{ fileName: string, message: string, baselineUri?: string, actualUri?: string }} ReportScreenshot
 * @typedef {{ project: string, file: string, name: string, errors: ReportError[], screenshots: ReportScreenshot[] }} ReportFailure
 * @typedef {{ project: string, file: string, suite: string, errors: ReportError[] }} ReportModuleError
 * @typedef {{
 *   total: number,
 *   passed: number,
 *   failed: number,
 *   skipped: number,
 *   reason: 'passed' | 'failed' | 'interrupted',
 *   failures: ReportFailure[],
 *   moduleErrors: ReportModuleError[],
 *   unhandledErrors: ReportError[],
 *   hasFailure: boolean,
 * }} ReportData
 */

/**
 * Transform Vitest reported entities into plain report data.
 * @param {ReadonlyArray<any>} testModules - `TestModule` instances from `onTestRunEnd`
 * @param {ReadonlyArray<any>} unhandledErrors - serialized unhandled errors
 * @param {'passed' | 'failed' | 'interrupted'} reason - run end reason
 * @param {string} root - project root used to compute relative paths
 * @returns {ReportData}
 */
export function collectReportData(testModules, unhandledErrors, reason, root) {
  /** @type {ReportData} */
  const data = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    reason,
    failures: [],
    moduleErrors: [],
    unhandledErrors: (unhandledErrors ?? []).map(toErrorData),
    hasFailure: false,
  }

  for (const testModule of testModules ?? []) {
    const project = testModule.project?.name || ''
    const file = toRelative(root, testModule.moduleId)

    // errors outside of tests - module collection errors or failed `beforeAll`/`afterAll` hooks
    const moduleErrors = testModule.errors?.() ?? []
    if (moduleErrors.length > 0) {
      data.moduleErrors.push({ project, file, suite: '', errors: moduleErrors.map(toErrorData) })
    }
    for (const testSuite of testModule.children?.allSuites() ?? []) {
      const suiteErrors = testSuite.errors?.() ?? []
      if (suiteErrors.length > 0) {
        data.moduleErrors.push({ project, file, suite: testSuite.fullName ?? testSuite.name, errors: suiteErrors.map(toErrorData) })
      }
    }

    for (const testCase of testModule.children?.allTests() ?? []) {
      const result = testCase.result()
      if (result.state === 'skipped') {
        data.skipped++
        continue
      }
      data.total++
      if (result.state === 'passed') {
        data.passed++
      } else if (result.state === 'failed') {
        data.failed++
        data.failures.push({
          project,
          file,
          name: testCase.fullName ?? testCase.name,
          errors: (result.errors ?? []).map(toErrorData),
          screenshots: (testCase.artifacts?.() ?? [])
            .filter(a => a?.type === SCREENSHOT_ARTIFACT_TYPE)
            .map(toScreenshotData),
        })
      }
    }
  }

  data.hasFailure = data.failed > 0
    || data.moduleErrors.length > 0
    || data.unhandledErrors.length > 0
    || reason !== 'passed'

  return data
}

/**
 * Render report data (see `collectReportData`) into a self-contained HTML document.
 * @param {ReportData} data
 * @param {string} titleTimestamp - timestamp displayed in the report title
 * @param {string} footerTimestamp - timestamp displayed in the report footer
 */
export function renderReport(data, titleTimestamp, footerTimestamp) {
  const entries = []

  for (const failure of data.failures) {
    entries.push(renderEntry({
      title: failure.name,
      location: formatLocation(failure.project, failure.file),
      errors: failure.errors,
      screenshots: failure.screenshots,
    }))
  }

  for (const moduleError of data.moduleErrors) {
    entries.push(renderEntry({
      title: moduleError.suite ? `Error in suite: ${moduleError.suite}` : 'Error in test module',
      location: formatLocation(moduleError.project, moduleError.file),
      errors: moduleError.errors,
    }))
  }

  for (const error of data.unhandledErrors) {
    entries.push(renderEntry({
      title: 'Unhandled error',
      location: 'Error was thrown outside of a test',
      errors: [error],
    }))
  }

  const head = fillTemplate(loadTemplate('report-head.html'), {
    TIMESTAMP: escapeHtml(titleTimestamp),
    STATUS: data.hasFailure ? 'failed' : 'passed',
    SUMMARY: escapeHtml(formatSummary(data)),
  })
  const tail = fillTemplate(loadTemplate('report-tail.html'), {
    TIMESTAMP: escapeHtml(footerTimestamp),
  })

  return head + entries.join('') + tail
}

/**
 * Build the one-line summary, e.g. `5/5 tests passed` or `3/5 tests passed, 2 failed`.
 * @param {ReportData} data
 */
export function formatSummary(data) {
  const parts = [`${data.passed}/${data.total} tests passed`]
  if (data.failed > 0) parts.push(`${data.failed} failed`)
  if (data.skipped > 0) parts.push(`${data.skipped} skipped`)
  if (data.moduleErrors.length > 0) parts.push(`${data.moduleErrors.length} module/suite error(s)`)
  if (data.unhandledErrors.length > 0) parts.push(`${data.unhandledErrors.length} unhandled error(s)`)
  let summary = parts.join(', ')
  if (data.reason === 'interrupted') summary += ' (test run was interrupted)'
  else if (data.hasFailure && data.failed === 0 && data.moduleErrors.length === 0 && data.unhandledErrors.length === 0) {
    summary += ' (test run failed)'
  }
  return summary
}

function renderEntry({ title, location, errors, screenshots = [] }) {
  return fillTemplate(loadTemplate('report-entry.html'), {
    TITLE: escapeHtml(title),
    LOCATION: escapeHtml(location),
    ERRORS: errors.map(renderError).join('\n'),
    SCREENSHOTS: screenshots.map(renderScreenshot).join('\n'),
  })
}

function renderError(error) {
  let html = `<pre class="message">${escapeHtml(error.message)}</pre>`
  if (error.diff) {
    html += `<details open><summary>Diff</summary><pre class="diff">${escapeHtml(error.diff)}</pre></details>`
  }
  if (error.stack) {
    html += `<details><summary>Stack trace</summary><pre class="stack">${escapeHtml(error.stack)}</pre></details>`
  }
  return html
}

function renderScreenshot(screenshot) {
  // attachments may be missing (e.g. stripped by Vitest), show at least the message
  if (!screenshot.baselineUri || !screenshot.actualUri) {
    return `<div class="screenshot"><h3>${escapeHtml(screenshot.fileName)}</h3><p class="message">${escapeHtml(screenshot.message)}</p></div>`
  }
  return fillTemplate(loadTemplate('report-screenshot.html'), {
    FILE_NAME: escapeHtml(screenshot.fileName),
    MESSAGE: escapeHtml(screenshot.message),
    BASELINE_URI: screenshot.baselineUri,
    ACTUAL_URI: screenshot.actualUri,
  })
}

function toErrorData(error) {
  const name = error?.name && error.name !== 'Error' ? `${error.name}: ` : ''
  return {
    message: stripAnsi(`${name}${error?.message ?? String(error)}`),
    diff: error?.diff ? stripAnsi(error.diff) : undefined,
    stack: error?.stack ? stripAnsi(error.stack) : undefined,
  }
}

function toScreenshotData(artifact) {
  const attachments = artifact.attachments ?? []
  const findUri = (name) => {
    const attachment = attachments.find(a => a?.name === name)
    if (!attachment?.body || typeof attachment.body !== 'string') return undefined
    if (attachment.bodyEncoding === 'utf-8') return undefined
    // only accept valid base64 payload and an image MIME type to keep the `src` attribute safe
    if (!BASE64_REGEX.test(attachment.body)) return undefined
    const contentType = IMAGE_MIME_REGEX.test(attachment.contentType ?? '') ? attachment.contentType : 'image/png'
    return `data:${contentType};base64,${attachment.body}`
  }
  return {
    fileName: artifact.fileName ?? '',
    message: artifact.message ?? '',
    baselineUri: findUri('baseline'),
    actualUri: findUri('actual'),
  }
}

function formatLocation(project, file) {
  return project ? `[${project}] ${file}` : file
}

function toRelative(root, path) {
  if (!path) return ''
  const rel = relative(root, path)
  return rel && !rel.startsWith('..') ? rel.replaceAll('\\', '/') : path
}

function openInBrowser(path, onError) {
  const openCmd
    = platform() === 'darwin'
      ? `open "${path}"`
      : platform() === 'win32'
        ? `start "" "${path}"`
        : `xdg-open "${path}"`
  exec(openCmd, (err) => {
    if (err) onError()
  })
}

// replace `{{KEY}}` placeholders
// function replacer avoids special `$` patterns of String.replace
function fillTemplate(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => key in values ? values[key] : match)
}

// timestamp string
// separators=false produces YYYYMMDDHHMMSS for report file name
// separators=true produces YYYY-MM-DD HH:MM:SS for report title
export function reportTimestamp(date, separators = false) {
  const pad2 = n => String(n).padStart(2, '0')
  const dateSeparator = separators ? '-' : ''
  const midSeparator = separators ? ' ' : ''
  const timeSeparator = separators ? ':' : ''
  return [
    date.getFullYear(),
    dateSeparator,
    pad2(date.getMonth() + 1),
    dateSeparator,
    pad2(date.getDate()),
    midSeparator,
    pad2(date.getHours()),
    timeSeparator,
    pad2(date.getMinutes()),
    timeSeparator,
    pad2(date.getSeconds()),
  ].join('')
}

const BASE64_REGEX = /^[A-Za-z0-9+/]+={0,2}$/
const IMAGE_MIME_REGEX = /^image\/[a-z0-9.+-]+$/i

// eslint-disable-next-line no-control-regex
const ANSI_REGEX = /\u001B\[[0-9;?]*[ -/]*[@-~]/g

function stripAnsi(value) {
  return String(value).replace(ANSI_REGEX, '')
}

// helper to escape a string for safe interpolation into the HTML report
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
  }[char] ?? char))
}
