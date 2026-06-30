import { exec } from 'node:child_process'
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { platform } from 'node:os'
import { resolve } from 'node:path'
import type { TestProject } from 'vitest/node'

declare module 'vitest' {
  interface ProvidedContext {
    screenshotReportPath: string
  }
}

// timestamp string in YYYYMMDDHHMMSS
function reportTimestamp(date: Date): string {
  const pad2 = (n: number) => String(n).padStart(2, '0')
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
    pad2(date.getHours()),
    pad2(date.getMinutes()),
    pad2(date.getSeconds()),
  ].join('')
}

// minimal HTML document for visual regression failures
function reportScaffold(date: Date): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Visual Regression Report</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem; background: #f5f5f5; color: #222; }
  h1 { font-size: 1.4rem; }
  .failure { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin: 1rem 0; box-shadow: 0 1px 3px rgba(0, 0, 0, .1); }
  .failure h2 { font-size: 1rem; margin: 0 0 .5rem; }
  .failure .meta { color: #b00; font-size: .85rem; margin: 0 0 .75rem; }
  .pair { display: flex; gap: 1rem; flex-wrap: wrap; }
  .pair figure { margin: 0; flex: 1 1 0; min-width: 240px; }
  .pair figcaption { font-size: .8rem; color: #555; margin-bottom: .25rem; }
  .pair img { max-width: 100%; border: 1px solid #ccc; background: #fff; }
</style>
</head>
<body>
<h1>Visual Regression Report &mdash; ${date.toISOString()}</h1>
`
}

// create an empty HTML report scaffold for visual regression failures
// the report is created inside the `__current__` folder
export function createScreenshotReport(targetDir = 'test/e2e', date = new Date()): string {
  const dir = resolve(process.cwd(), targetDir, '__current__')
  mkdirSync(dir, { recursive: true })

  const reportPath = resolve(dir, `report-${reportTimestamp(date)}.html`)
  writeFileSync(reportPath, reportScaffold(date))
  return reportPath
}

// Vitest globalSetup entry point
// - creates the HTML report file once on startup
// - exposes its path to `compareScreenshot` via provide/inject
// / closes the HTML report via a callback once tests are finished
export default function setup({ provide }: TestProject) {
  const reportPath = createScreenshotReport()
  provide('screenshotReportPath', reportPath)

  return () => {
    appendFileSync(reportPath, '</body>\n</html>\n')
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
