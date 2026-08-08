#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { getPackageManager, hasJsonKey, promptUser, showMessage } from 'elrh-cosca'
import { getPlaywrightInstallCmd, getUpdateCmd } from './helpers/commands.js'

const TARGET_VERSION = '0.3.1'

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
  const isInstalled = hasJsonKey('package.json', `dependencies.nuxt-spec`)
    || hasJsonKey('package.json', `devDependencies.nuxt-spec`)
  if (!isInstalled) {
    console.error(`'nuxt-spec' was not found in your 'package.json'. Run the 'setup' command first.`)
    process.exit(1)
  }

  const isAutoRun = autoRun || await promptUser('Do you want to update everything automatically (no more prompts)?')
  showMessage('')

  const packageManager = getPackageManager()

  // 1) run 'update nuxt-spec'
  const updateCmd = getUpdateCmd(packageManager, `nuxt-spec@${TARGET_VERSION}`)
  const runUpdate = isAutoRun || await promptUser(`This will bump 'nuxt-spec' to version '${TARGET_VERSION}' by running \`${updateCmd}\`. Continue?`)
  if (runUpdate) {
    try {
      showMessage(`Running \`${updateCmd}\`...`)
      execSync(updateCmd, { stdio: 'inherit' })
    } catch (error) {
      console.error(`Error running \`${updateCmd}\`:\n`, error.message)
    }
  }

  // 2) run 'playwright-core install'
  const playwrightUpdateCmd = getPlaywrightInstallCmd(packageManager)
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
    showMessage(`Run \`${updateCmd}\` to update 'nuxt-spec'.`)
  }
  if (!runPlaywrightUpdate) {
    showMessage(`Run \`${playwrightUpdateCmd}\` to update the Playwright browser runtimes for e2e tests.`)
  }

  // force exit to prevent #20
  process.exit(0)
}
