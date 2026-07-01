import { exec } from 'node:child_process'
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { platform } from 'node:os'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { TestProject } from 'vitest/node'

declare module 'vitest' {
  interface ProvidedContext {
    screenshotReportPath: string
  }
}

const templatesDir = resolve(fileURLToPath(import.meta.url), '..', 'html')

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

// create an empty HTML report scaffold for visual regression failures
// the report is created inside the `__current__` folder
export function createScreenshotReport(targetDir = 'test/e2e', date = new Date()): string {
  const dir = resolve(process.cwd(), targetDir, '__current__')
  mkdirSync(dir, { recursive: true })

  const fileTimestamp = reportTimestamp(date)
  const titleTimestamp = reportTimestamp(date, true)

  const reportPath = resolve(dir, `report-${fileTimestamp}.html`)
  writeFileSync(reportPath, reportScaffold(titleTimestamp))
  return reportPath
}

// Vitest globalSetup entry point
// - creates the HTML report file once on startup
// - exposes its path to `compareScreenshot` via provide/inject
// - closes the HTML report via a callback once tests are finished
export default function setup({ provide }: TestProject) {
  const reportPath = createScreenshotReport()
  provide('screenshotReportPath', reportPath)

  return () => {
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
