import { exec } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { platform } from 'node:os'
import { resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DecodedPng } from 'fast-png'

const templatesDir = resolve(fileURLToPath(import.meta.url), '..')
const REPORT_ENTRY = readFileSync(resolve(templatesDir, 'report-entry.html'), 'utf-8')
const REPORT_PATH = resolve(process.cwd(), '.report-path')
const REPORT_LOCK = resolve(process.cwd(), '.report-lock')

// create report file on first call
// protected from parallel execution issues
export function ensureReportCreated(targetDir = 'test/e2e'): void {
  withConcurrentLock(() => {
    let reportPath: string

    if (existsSync(REPORT_PATH)) {
      // Keep exactly one shared report per test run; first writer wins.
      reportPath = readFileSync(REPORT_PATH, 'utf-8').trim()
    } else {
      const root = process.cwd()
      const dir = resolveWithin(root, targetDir)
      const fileTimestamp = process.env.SCREENSHOT_REPORT_TIMESTAMP ?? reportTimestamp(new Date())
      reportPath = resolve(dir, '__current__', `report-${fileTimestamp}.html`)
      writeFileSync(REPORT_PATH, reportPath)
    }

    process.env.SCREENSHOT_REPORT_PATH = reportPath
    if (!reportPath || existsSync(reportPath)) return

    const titleTimestamp = process.env.SCREENSHOT_REPORT_TITLE ?? reportTimestamp(new Date(), true)
    mkdirSync(resolve(reportPath, '..'), { recursive: true })

    const template = readFileSync(resolve(templatesDir, 'report-head.html'), 'utf-8')
    const report = template.replace('{{TIMESTAMP}}', titleTimestamp)
    writeFileSync(reportPath, report)
  })
}

// append a side-by-side baseline/actual comparison
// to the HTML report if the screenshots don't match
// protected from parallel execution issues
export function appendToReport(fileName: string, message: string, baseline: Uint8Array, actual: Uint8Array): void {
  const baselineUri = `data:image/png;base64,${Buffer.from(baseline).toString('base64')}`
  const actualUri = `data:image/png;base64,${Buffer.from(actual).toString('base64')}`

  const entry = REPORT_ENTRY
    .replace('{{FILE_NAME}}', escapeHtml(fileName))
    .replace('{{MESSAGE}}', escapeHtml(message))
    .replace('{{BASELINE_URI}}', baselineUri)
    .replace('{{ACTUAL_URI}}', actualUri)

  withConcurrentLock(() => {
    const reportPath = process.env.SCREENSHOT_REPORT_PATH || (existsSync(REPORT_PATH)
      ? readFileSync(REPORT_PATH, 'utf-8').trim()
      : '')
    if (!reportPath || !existsSync(reportPath)) return

    appendFileSync(reportPath, entry)
  })
}

// Vitest globalSetup entry point
// - computes stable timestamp values and exposes them via env variables
// - the report file itself is created lazily on first compareScreenshot call
// - provides a callback to close the HTML report once tests are finished (if it was created)
export function screenshotSetup() {
  const NOW = new Date()
  const fileTimestamp = reportTimestamp(NOW)
  const titleTimestamp = reportTimestamp(NOW, true)

  process.env.SCREENSHOT_REPORT_TIMESTAMP = fileTimestamp
  process.env.SCREENSHOT_REPORT_TITLE = titleTimestamp

  return () => {
    if (!existsSync(REPORT_PATH)) return

    const reportPath = readFileSync(REPORT_PATH, 'utf-8').trim()
    unlinkSync(REPORT_PATH)

    if (!reportPath) return
    if (!existsSync(reportPath)) return

    let footer = readFileSync(resolve(templatesDir, 'report-tail.html'), 'utf-8')
    footer = footer.replace('{{TIMESTAMP}}', new Date().toISOString())
    appendFileSync(reportPath, footer)
    console.log(`\n(nuxt-spec) Visual regression report available at:\nfile://${reportPath}`)

    if (!process.env.CI) {
      console.log('(nuxt-spec) Opening report in default browser...')
      const openCmd = platform() === 'darwin' ? 'open' : platform() === 'win32' ? 'start' : 'xdg-open'
      exec(`${openCmd} "${reportPath}"`, (err) => {
        if (err) {
          console.log('(nuxt-spec) Failed to automatically open report')
        }
      })
    }

    console.log('\n')
  }
}

// helper to keep user-provided targetDir inside the current project root
export function resolveWithin(base: string, segment: string): string {
  const target = resolve(base, segment)
  if (target !== base && !target.startsWith(base + sep)) {
    throw new Error(`Invalid path: "${segment}" resolves outside of "${base}"`)
  }
  return target
}

// helper for bridging difference between Vitest PNG saving and fast-png encoding
export function toRGBA(img: DecodedPng): Uint8Array {
  const { width, height, data, channels = 4 } = img
  if (channels === 4) return data as Uint8Array
  const pixels = width * height
  const rgba = new Uint8Array(pixels * 4)
  for (let i = 0; i < pixels; i++) {
    rgba[i * 4] = data[i * 3]
    rgba[i * 4 + 1] = data[i * 3 + 1]
    rgba[i * 4 + 2] = data[i * 3 + 2]
    rgba[i * 4 + 3] = 255
  }
  return rgba
}

// protection from parallel execution issues
function withConcurrentLock<T>(fn: () => T): T {
  const start = Date.now()

  while (true) {
    try {
      // try acquiring the lock
      writeFileSync(REPORT_LOCK, String(process.pid), { flag: 'wx' })
      break
    } catch (error) {
      // we only expect "file already exists" error
      // otherwise it is an issue
      const code = (error as NodeJS.ErrnoException).code
      if (code !== 'EEXIST') throw error

      try {
        const lockAge = Date.now() - statSync(REPORT_LOCK).mtimeMs
        if (lockAge > 30_000) {
          // stale lock
          unlinkSync(REPORT_LOCK)
          continue
        }
      } catch {
        // lock disappeared between checks, retry acquisition
      }

      if (Date.now() - start > 10_000) {
        // not successful in 10 minutes, give up
        throw new Error('Timed out while waiting for screenshot report lock', {
          cause: error,
        })
      }

      // sleep before next attempt
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25)
    }
  }

  try {
    return fn()
  } finally {
    try {
      unlinkSync(REPORT_LOCK)
    } catch {
      // lock file may already be removed
    }
  }
}

// timestamp string
// separators=false produces YYYYMMDDHHMMSS for report file name
// separators=true produces YYYY-MM-DD HH:MM:SS for report title
function reportTimestamp(date: Date, separators = false): string {
  const pad2 = (n: number) => String(n).padStart(2, '0')
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

// helper to escape a string for safe interpolation into the HTML report
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
  }[char] ?? char))
}
