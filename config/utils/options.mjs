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

// raw `spec` values per cwd - nuxt.config.ts is only loaded once
const specCache = new Map()

/**
 * Resolve final Nuxt Spec options.
 * @param {import('./options.d.mts').NuxtSpecOptions | false | null} [fromConfig] - `spec` key from nuxt.config.ts
 * @param {Record<string, string | undefined>} [env] - env variables
 * @returns {import('./options.d.mts').ResolvedNuxtSpecOptions}
 */
export function resolveSpecOptions(fromConfig, env = process.env) {
  const config = isObject(fromConfig) ? fromConfig : {}
  const htmlReport = isObject(config.htmlReport) ? config.htmlReport : {}
  return {
    hints: toBoolean(env.NUXT_SPEC_HINTS_ENABLED)
      ?? config.hints
      ?? NUXT_SPEC_DEFAULTS.hints,
    externalPlaywright: env.NUXT_SPEC_EXTERNAL_PLAYWRIGHT
      || config.externalPlaywright
      || NUXT_SPEC_DEFAULTS.externalPlaywright,
    htmlReport: {
      enabled: toBoolean(env.NUXT_SPEC_HTML_REPORT)
        ?? htmlReport.enabled
        ?? NUXT_SPEC_DEFAULTS.htmlReport.enabled,
      open: env.NUXT_SPEC_HTML_REPORT_OPEN
        || htmlReport.open
        || NUXT_SPEC_DEFAULTS.htmlReport.open,
    },
    messageFilters: [
      ...(Array.isArray(config.messageFilters) ? config.messageFilters : []),
      ...(env.NUXT_SPEC_MESSAGE_FILTERS?.split(',') ?? []),
    ]
      .filter(f => typeof f === 'string')
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
  return typeof value === 'object' && value !== null
}

// unset or empty = not defined, only explicit 'false' disables
function toBoolean(value) {
  if (value === undefined || value === '') return undefined
  return value !== 'false'
}
