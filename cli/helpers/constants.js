import { readFileSync } from 'node:fs'

// current `nuxt-spec` version (derived from package.json entry)
export const SPEC_VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version

// URL to current tag in GitHub repository to fetch template files in CLI scripts
export const SPEC_URL = `https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/tags/v${SPEC_VERSION}`

// current Playwright version for usage in CLI scripts
export const PLAYWRIGHT_VERSION = '1.64.1'
