// Nuxt Spec options resolution
// - values can be set via `spec` key in nuxt.config.ts or via NUXT_SPEC_* env variables
// - precedence: env variables > nuxt.config.ts > defaults

import { loadNuxtConfig } from 'nuxt/kit'

export const NUXT_SPEC_DEFAULTS = {
  hints: true,
  externalPlaywright: undefined,
  htmlReport: {
    enabled: true,
    open: 'failed',
  },
  messageFilters: [],
}

const HTML_REPORT_OPEN_MODES = ['always', 'failed', 'never']

// raw `spec` values per cwd - nuxt.config.ts is only loaded once
const specCache = new Map()

// options are resolved by both the Nuxt module and the Vitest config in the same process
const reportedWarnings = new Set()

/**
 * Resolve final Nuxt Spec options.
 * @param {import('./options.d.mts').NuxtSpecOptions | false | null} [fromConfig] - `spec` key from nuxt.config.ts
 * @param {Record<string, string | undefined>} [env] - env variables
 * @returns {import('./options.d.mts').ResolvedNuxtSpecOptions}
 */
export function resolveSpecOptions(fromConfig, env = process.env) {
  const config = isObject(fromConfig) ? fromConfig : {}
  const htmlReport = checkType('htmlReport', config.htmlReport, 'object') ?? {}
  return {
    hints: toBoolean(env.NUXT_SPEC_HINTS_ENABLED)
      ?? checkType('hints', config.hints, 'boolean')
      ?? NUXT_SPEC_DEFAULTS.hints,
    externalPlaywright: env.NUXT_SPEC_EXTERNAL_PLAYWRIGHT
      || checkType('externalPlaywright', config.externalPlaywright, 'string')
      || NUXT_SPEC_DEFAULTS.externalPlaywright,
    htmlReport: {
      enabled: toBoolean(env.NUXT_SPEC_HTML_REPORT)
        ?? checkType('htmlReport.enabled', htmlReport.enabled, 'boolean')
        ?? NUXT_SPEC_DEFAULTS.htmlReport.enabled,
      open: env.NUXT_SPEC_HTML_REPORT_OPEN
        ? toOpenMode('NUXT_SPEC_HTML_REPORT_OPEN', env.NUXT_SPEC_HTML_REPORT_OPEN)
        : toOpenMode('htmlReport.open', htmlReport.open),
    },
    messageFilters: [
      ...(checkType('messageFilters', config.messageFilters, 'array') ?? []),
      ...(env.NUXT_SPEC_MESSAGE_FILTERS?.split(',') ?? []),
    ]
      .filter((f) => {
        if (typeof f === 'string') return true
        warnInvalid('messageFilters', f, 'string', 'Value is ignored.')
        return false
      })
      .map(f => f.trim())
      // empty pattern would match (and swallow) every message
      .filter(Boolean),
  }
}

/**
 * Load `spec` key from nuxt.config.ts (including extended layers)
 * and resolve final Nuxt Spec options.
 * @param {string} [cwd] - directory with nuxt.config.ts
 * @returns {Promise<import('./options.d.mts').ResolvedNuxtSpecOptions>}
 */
export async function loadSpecOptions(cwd = process.cwd()) {
  if (!specCache.has(cwd)) {
    specCache.set(cwd, loadNuxtConfig({ cwd })
      .then(config => config.spec)
      .catch((error) => {
        console.warn(`[Nuxt Spec] Failed to read \`spec\` options from nuxt.config: ${error?.message ?? error}`)
        return undefined
      }))
  }
  return resolveSpecOptions(await specCache.get(cwd))
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// returns the value if it matches the expected type, otherwise warns and returns undefined
function checkType(option, value, type) {
  if (value === undefined) return undefined
  const matches = type === 'object'
    ? isObject(value)
    : type === 'array' ? Array.isArray(value) : typeof value === type
  if (matches) return value
  warnInvalid(option, value, type)
  return undefined
}

function toOpenMode(option, value) {
  if (value === undefined) return NUXT_SPEC_DEFAULTS.htmlReport.open
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : value
  if (HTML_REPORT_OPEN_MODES.includes(normalized)) return normalized
  warnInvalid(option, value, HTML_REPORT_OPEN_MODES.map(m => `'${m}'`).join(' | '))
  return NUXT_SPEC_DEFAULTS.htmlReport.open
}

function warnInvalid(option, value, expected, outcome = 'Falling back to default.') {
  const message = `[Nuxt Spec] Invalid value ${JSON.stringify(value) ?? String(value)} for \`${option}\` (expected ${expected}). ${outcome}`
  if (reportedWarnings.has(message)) return
  reportedWarnings.add(message)
  console.warn(message)
}

// unset or empty = not defined, only explicit 'false' disables
function toBoolean(value) {
  if (value === undefined || value === '') return undefined
  return value !== 'false'
}
