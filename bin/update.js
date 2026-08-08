#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { getPackageManager, hasJsonKey, promptUser, showMessage } from 'elrh-cosca'

const PACKAGE_NAME = 'nuxt-spec'
const TARGET_VERSION = '0.3.0'

/**
 * CLI tool to update existing `nuxt-spec` installation.
 *
 * It first asks whether to run in "auto" mode (no prompts, force = true) or "manual" mode (with prompts, force = false).
 *
 * Then it:
 *  1) verifies `nuxt-spec` is present in `package.json` (fails with a hint to run `setup` otherwise)
 *  2) runs the package manager's update command to bump `nuxt-spec` to the latest version
 *  3) run the `playwright-core install` command to ensure the Playwright browser runtimes are up to date
 *
 * @param {boolean} autoRun - Whether to run the update automatically without any prompts (defaults to false).
 */
export async function specUpdate(autoRun = false) {
  showMessage('NUXT SPEC UPDATE')
  showMessage('This CLI tool will help you update Nuxt Spec in your project.')
  showMessage('Refer to the documentation for more information.', 2)

  // fail fast if there is nothing to update
  const isInstalled = hasJsonKey('package.json', `dependencies.${PACKAGE_NAME}`)
    || hasJsonKey('package.json', `devDependencies.${PACKAGE_NAME}`)
  if (!isInstalled) {
    console.error(`'${PACKAGE_NAME}' was not found in your 'package.json'. Run the 'setup' command first.`)
    process.exit(1)
  }

  const isAutoRun = autoRun || await promptUser('Do you want to update everything automatically (no more prompts)?')
  showMessage('')

  const packageManager = getPackageManager()

  // 1) run 'update nuxt-spec'
  const updateCmd = getUpdateCmd(packageManager)
  const runUpdate = isAutoRun || await promptUser(`This will bump '${PACKAGE_NAME}' to version '${TARGET_VERSION}' by running \`${updateCmd}\`. Continue?`)
  if (runUpdate) {
    try {
      showMessage(`Running \`${updateCmd}\`...`)
      execSync(updateCmd, { stdio: 'inherit' })
    } catch (error) {
      console.error(`Error running \`${updateCmd}\`:\n`, error.message)
    }
  }

  // 2) run 'playwright-core install'
  const playwrightUpdateCmd = getPlaywrightUpdateCmd(packageManager)
  const runPlaywrightUpdate = isAutoRun || await promptUser(`Playwright browser runtimes might need to be updated for e2e tests. Do you want to run \`${playwrightUpdateCmd}\` now?`)
  if (runPlaywrightUpdate) {
    try {
      showMessage(`Running \`${playwrightUpdateCmd}\`...`)
      execSync(playwrightUpdateCmd, { stdio: 'inherit' })
    } catch (error) {
      console.error(`Error running \`${playwrightUpdateCmd}\`:\n`, error.message)
    }
  }

  // 3) inform user
  showMessage('')
  showMessage('NUXT SPEC UPDATE COMPLETE', 2)
  if (!runUpdate) {
    showMessage(`Run \`${updateCmd}\` to update '${PACKAGE_NAME}'.`)
  }
  if (!runPlaywrightUpdate) {
    showMessage(`Run \`${playwrightUpdateCmd}\` to update the Playwright browser runtimes for e2e tests.`)
  }

  // force exit to prevent #20
  process.exit(0)
}

function getUpdateCmd(packageManager) {
  const target = `${PACKAGE_NAME}@${TARGET_VERSION}`
  switch (packageManager) {
    case 'pnpm':
      return `pnpm update ${target}`
    case 'yarn':
      return `yarn upgrade ${target}`
    case 'bun':
      return `bun update ${target}`
    case 'deno':
      return `deno add npm:${target}`
    default:
      return `npm update ${target}`
  }
}

function getPlaywrightUpdateCmd(packageManager) {
  const command = 'playwright-core install'
  switch (packageManager) {
    case 'pnpm':
      return `pnpm exec ${command}`
    case 'yarn':
      return `yarn ${command}`
    case 'bun':
      return `bunx ${command}`
    case 'deno':
      return `deno run -A npm:${command}`
    default:
      return `npx ${command}`
  }
}
