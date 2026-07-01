import { exec } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { platform } from 'node:os'
import { resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const templatesDir = resolve(fileURLToPath(import.meta.url), '..', 'html')
const reportPathFile = resolve(process.cwd(), '.report-path')

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

// create report file on first call, using targetDir from compareScreenshot options
export function ensureReportCreated(targetDir = 'test/e2e'): void {
  const root = process.cwd()
  const dir = resolveWithin(root, targetDir)
  const fileTimestamp = process.env.SCREENSHOT_REPORT_TIMESTAMP ?? reportTimestamp(new Date())
  const reportPath = resolve(dir, '__current__', `report-${fileTimestamp}.html`)

  process.env.SCREENSHOT_REPORT_PATH = reportPath
  writeFileSync(reportPathFile, reportPath)
  if (!reportPath || existsSync(reportPath)) return

  const titleTimestamp = process.env.SCREENSHOT_REPORT_TITLE ?? reportTimestamp(new Date(), true)

  mkdirSync(resolve(dir, '__current__'), { recursive: true })
  writeFileSync(reportPath, reportScaffold(titleTimestamp))
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
