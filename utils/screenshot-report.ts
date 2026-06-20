import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { TestProject } from 'vitest/node'

// make the report path available to tests through Vitest's provide/inject
declare module 'vitest' {
  interface ProvidedContext {
    screenshotReportPath: string
  }
}

// build a timestamp string in the format YYYYMMDDHHMMSS
function reportTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('')
}

// minimal HTML document opening with styling; failure entries are appended later
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
// returns the absolute path to the created report file
// the report lives inside the `__current__` folder so it is not committed
export function createScreenshotReport(targetDir = 'test/e2e', date = new Date()): string {
  const dir = resolve(process.cwd(), targetDir, '__current__')
  mkdirSync(dir, { recursive: true })

  const reportPath = resolve(dir, `report-${reportTimestamp(date)}.html`)
  writeFileSync(reportPath, reportScaffold(date))
  return reportPath
}

// Vitest globalSetup entry point: create the report file once per run and
// expose its path to the tests (and `compareScreenshot`) via provide/inject
export default function setup({ provide }: TestProject) {
  const reportPath = createScreenshotReport()
  provide('screenshotReportPath', reportPath)

  // teardown: drop the report again if no failures were ever recorded
  return () => {
    if (existsSync(reportPath) && !readFileSync(reportPath, 'utf8').includes('class="failure"')) {
      unlinkSync(reportPath)
    }
  }
}
