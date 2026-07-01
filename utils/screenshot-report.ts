import { exec } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { platform } from 'node:os'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inject } from 'vitest'
import type { ProvidedContext } from 'vitest'
import type { TestProject } from 'vitest/node'

declare module 'vitest' {
  interface ProvidedContext {
    screenshotReportPath: string
    screenshotReportTitle: string
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

// resolve the value created in the Vitest globalSetup helper
// (provide/inject is preferred, with process.env kept as a fallback)
export function getInjection(key: keyof ProvidedContext): string | undefined {
  try {
    const injected = inject(key)
    if (injected) return injected
  } catch (e) {
    // `inject` is unavailable outside of the Vitest worker context
    console.debug(`(nuxt-spec) getInjection(${key}) - error during Vitest injection`)
    console.error((e as Error).message || e)
  }

  console.debug(`(nuxt-spec) getInjection(${key}) - falling back to process.env`)

  // env variable fallbacks
  switch (key) {
    case 'screenshotReportPath':
      return process.env.SCREENSHOT_REPORT_PATH
    case 'screenshotReportTitle':
      return process.env.SCREENSHOT_REPORT_TITLE
    default:
      return undefined
  }
}

// create report file on first call, using the path computed in setup()
export function ensureReportCreated(): void {
  const reportPath = getInjection('screenshotReportPath')
  if (!reportPath || existsSync(reportPath)) return

  const titleTimestamp = getInjection('screenshotReportTitle') ?? reportTimestamp(new Date(), true)

  writeFileSync(reportPath, reportScaffold(titleTimestamp))
}

// Vitest globalSetup entry point
// - computes the report path and exposes it via provide/inject
// - the report file is created lazily on first compareScreenshot call
// - closes the HTML report via a callback once tests are finished (if it was created)
export default function setup({ provide }: TestProject) {
  const dir = resolve(process.cwd(), 'test/e2e', '__current__')
  mkdirSync(dir, { recursive: true })

  const NOW = new Date()
  const reportPath = resolve(dir, `report-${reportTimestamp(NOW)}.html`)
  provide('screenshotReportPath', reportPath)
  provide('screenshotReportTitle', reportTimestamp(NOW, true))

  return () => {
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
