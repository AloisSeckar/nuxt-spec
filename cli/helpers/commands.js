import { getPackageManager } from 'elrh-cosca'
import { SPEC_VERSION } from './constants.js'

export { runCmd } from './run.js'

export const SUPPORTED_PACKAGE_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun', 'deno']

// get the package manager name for usage in commands
// explicit override takes precedence over auto-detection
export function resolvePackageManager(override) {
  if (override) {
    if (!SUPPORTED_PACKAGE_MANAGERS.includes(override)) {
      throw new Error(`Unsupported package manager '${override}'. Use one of: ${SUPPORTED_PACKAGE_MANAGERS.join(', ')}`)
    }
    return override
  }
  return getPackageManager()
}

/**
 * Kinds of commands the CLI can build via `getCmd()`.
 */
export const CommandType = Object.freeze({
  // `nuxt-spec-cli` itself
  CLI: 'cli',
  // bump `nuxt-spec` to the current version
  UPDATE_SPEC: 'update-spec',
  // scaffold a new Nuxt project into the current (empty) directory
  CREATE_NUXT: 'create-nuxt',
  // generate Nuxt types and auto-imports
  NUXT_PREPARE: 'nuxt-prepare',
  // run the sample browser test (creates its missing reference screenshot)
  FIRST_TEST_RUN: 'first-test-run',
  // install/update Playwright browser runtimes
  PLAYWRIGHT_INSTALL: 'playwright-install',
})

// command prefixes per package manager (each ends where the command or package name starts)
// exec = run a locally installed binary, dlx = download and run a binary
const PM_SYNTAX = {
  npm: { exec: 'npx ', dlx: 'npx ', create: 'npm create nuxt@latest -- ', update: 'npm install ' },
  pnpm: { exec: 'pnpm exec ', dlx: 'pnpx ', create: 'pnpm create nuxt@latest ', update: 'pnpm update ' },
  yarn: { exec: 'yarn ', dlx: 'yarn dlx ', create: 'yarn create nuxt ', update: 'yarn up ' },
  bun: { exec: 'bunx ', dlx: 'bunx ', create: 'bun create nuxt@latest ', update: 'bun update ' },
  deno: { exec: 'deno run -A npm:', dlx: 'deno run -A npm:', create: 'deno run -A npm:create-nuxt@latest ', update: 'deno add npm:' },
}

/**
 * Builds the command syntax for given package manager.
 *
 * @param {string} packageManager - `npm`, `pnpm`, `yarn`, `bun` or `deno` (anything else falls back to `npm`).
 * @param {string} commandType - One of `CommandType` values.
 * @returns {string} Command ready to be run in a shell.
 */
export function getCmd(packageManager, commandType) {
  const syntax = PM_SYNTAX[packageManager] ?? PM_SYNTAX.npm
  switch (commandType) {
    case CommandType.CLI:
      return `${syntax.dlx}nuxt-spec-cli`
    case CommandType.UPDATE_SPEC:
      return `${syntax.update}nuxt-spec@${SPEC_VERSION}`
    case CommandType.CREATE_NUXT:
      // `--force` skips the "directory already exists" prompt; dependencies are installed later in the setup
      return `${syntax.create}. --force --template minimal --packageManager ${packageManager} --gitInit=false --install=false --no-modules`
    case CommandType.NUXT_PREPARE:
      return `${syntax.exec}nuxt prepare`
    case CommandType.FIRST_TEST_RUN:
      return `${syntax.exec}vitest run test/browser/vitest-browser.test.ts`
    case CommandType.PLAYWRIGHT_INSTALL:
      return `${syntax.exec}playwright install`
    default:
      throw new Error(`Unknown command type '${commandType}'`)
  }
}
