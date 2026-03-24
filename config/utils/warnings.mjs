const messageFilters = [
  // remove once @nuxt/test-utils starts depending on Vitest 4.1
  // https://github.com/nuxt/test-utils/pull/1620
  'Importing from "vitest/environments" is deprecated',
  // Node+Windows false positive
  // https://github.com/nuxt/icon/issues/140
  'Use of deprecated trailing slash pattern mapping',
  // remove once Vue stops considering <Suspense> experimental
  '<Suspense> is an experimental feature',
]

// 1) filter-out unnecessary stderr/stdout logs coming from Vitest
// (applied as side-effect on import)

const _stderrWrite = process.stderr.write.bind(process.stderr)
process.stderr.write = (chunk, ...args) => {
  if (typeof chunk === 'string' && messageFilters.some(f => chunk.includes(f))) return true
  return _stderrWrite(chunk, ...args)
}

const _stdoutWrite = process.stdout.write.bind(process.stdout)
process.stdout.write = (chunk, ...args) => {
  if (typeof chunk === 'string' && messageFilters.some(f => chunk.includes(f))) return true
  return _stdoutWrite(chunk, ...args)
}

// 2) filter-out unnecessary console logs coming from Vitest
// (used as Vitest onConsoleLog hook)

export function onConsoleLog(log) {
  if (messageFilters.some(f => log.includes(f))) return false
}
