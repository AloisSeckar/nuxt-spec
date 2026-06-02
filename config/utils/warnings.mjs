const messageFilters = [
  // Node+Windows false positive
  // https://github.com/nuxt/icon/issues/140
  'Use of deprecated trailing slash pattern mapping',
  // remove once Vue stops considering <Suspense> experimental
  '<Suspense> is an experimental feature',
  // merge defaults with user-defined filters from NUXT_SPEC_MESSAGE_FILTERS env variable
  ...(process.env.NUXT_SPEC_MESSAGE_FILTERS
    ? process.env.NUXT_SPEC_MESSAGE_FILTERS.split(',')
    : []),
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
