import { exec } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { platform } from 'node:os'
import { resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const templatesDir = resolve(fileURLToPath(import.meta.url), '..', 'html')
const reportPathFile = resolve(process.cwd(), '.report-path')
const reportLockFile = resolve(process.cwd(), '.report-lock')

function withConcurrentLock<T>(fn: () => T): T {
  const start = Date.now()

  while (true) {
    try {
      // try acquiring the lock
      writeFileSync(reportLockFile, String(process.pid), { flag: 'wx' })
      break
    } catch (error) {
      // we only expect "file already exists" error
      // otherwise it is an issue
      const code = (error as NodeJS.ErrnoException).code
      if (code !== 'EEXIST') throw error

      try {
        const lockAge = Date.now() - statSync(reportLockFile).mtimeMs
        if (lockAge > 30_000) {
          // stale lock
          unlinkSync(reportLockFile)
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
      unlinkSync(reportLockFile)
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

// read the header template and replace the timestamp placeholder
function reportScaffold(titleTimestamp: string): string {
  const template = readFileSync(resolve(templatesDir, 'report-head.html'), 'utf-8')
  return template.replace('{{TIMESTAMP}}', titleTimestamp)
}

// helper to keep user-provided targetDir inside the current project root
function resolveWithin(base: string, segment: string): string {
  const target = resolve(base, segment)
  if (target !== base && !target.startsWith(base + sep)) {
    throw new Error(`Invalid path: "${segment}" resolves outside of "${base}"`)
  }
  return target
}

// create report file on first call
// protected from parallel execution issues
export function ensureReportCreated(targetDir = 'test/e2e'): void {
  withConcurrentLock(() => {
    let reportPath: string

    if (existsSync(reportPathFile)) {
      // Keep exactly one shared report per test run; first writer wins.
      reportPath = readFileSync(reportPathFile, 'utf-8').trim()
    } else {
      const root = process.cwd()
      const dir = resolveWithin(root, targetDir)
      const fileTimestamp = process.env.SCREENSHOT_REPORT_TIMESTAMP ?? reportTimestamp(new Date())
      reportPath = resolve(dir, '__current__', `report-${fileTimestamp}.html`)
      writeFileSync(reportPathFile, reportPath)
    }

    process.env.SCREENSHOT_REPORT_PATH = reportPath
    if (!reportPath || existsSync(reportPath)) return

    const titleTimestamp = process.env.SCREENSHOT_REPORT_TITLE ?? reportTimestamp(new Date(), true)
    mkdirSync(resolve(reportPath, '..'), { recursive: true })
    writeFileSync(reportPath, reportScaffold(titleTimestamp))
  })
}

// append HTML entry into report file
// protected from parallel execution issues
export function appendToReportFile(entry: string): void {
  withConcurrentLock(() => {
    const reportPath = process.env.SCREENSHOT_REPORT_PATH || (existsSync(reportPathFile)
      ? readFileSync(reportPathFile, 'utf-8').trim()
      : '')
    if (!reportPath || !existsSync(reportPath)) return

    appendFileSync(reportPath, entry)
  })
}

// Vitest globalSetup entry point
// - computes stable timestamp values and exposes them via env variables
// - the report file itself is created lazily on first compareScreenshot call
// - provides a callback to close the HTML report once tests are finished (if it was created)
export default function setup() {
  const NOW = new Date()
  const fileTimestamp = reportTimestamp(NOW)
  const titleTimestamp = reportTimestamp(NOW, true)

  process.env.SCREENSHOT_REPORT_TIMESTAMP = fileTimestamp
  process.env.SCREENSHOT_REPORT_TITLE = titleTimestamp

  return () => {
    if (!existsSync(reportPathFile)) return

    const reportPath = readFileSync(reportPathFile, 'utf-8').trim()
    unlinkSync(reportPathFile)

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
