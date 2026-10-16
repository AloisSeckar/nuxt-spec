#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import {
  hasJsonKey, pathExists, promptUser, showMessage,
} from 'elrh-cosca'
import { CI_TEMPLATES } from './ci.js'
import {
  getPlaywrightInstallCmd, getPrepareCmd, getUpdateCmd,
} from '../helpers/commands.js'
import { SPEC_VERSION, PLAYWRIGHT_VERSION } from '../helpers/constants.js'

// for automated version patching in CI workflow files
const PLAYWRIGHT_IMAGE_REGEX = /(mcr\.microsoft\.com\/playwright:v)\d+\.\d+\.\d+/g

/**
 * CLI tool to update existing `nuxt-spec` installation.
 *
 * It first asks whether to run in "auto" mode (no prompts, force = true) or "manual" mode (with prompts, force = false).
 *
 * Then it:
 *  1) verifies `nuxt-spec` is present in `package.json` (fails with a hint to run `setup` otherwise)
 *  2) runs the package manager's update command to bump `nuxt-spec` to the latest version
 *  3) run the `nuxt prepare` command to regenerate types and auto-imports
 *  4) run the `playwright install` command to ensure the Playwright browser runtimes are up to date
 *  5) bump the Playwright container image version in CI workflow files created by the `ci` command
 *
 * @param {boolean} autoRun - Whether to run the update automatically without any prompts (defaults to false).
 * @param {string} [packageManager] - Package manager to be used (`npm`, `pnpm`, `yarn`, `bun` or `deno`).
 */
export async function specUpdate(autoRun = false, packageManager) {
  showMessage({ message: 'NUXT SPEC UPDATE' })
  showMessage({ message: 'This CLI tool will help you update Nuxt Spec in your project.' })
  showMessage({ message: 'Refer to the documentation for more information.', linesAfter: 2 })

  // fail fast if there is nothing to update
  const isInstalled = hasJsonKey({ targetFile: 'package.json', jsonKey: `dependencies.nuxt-spec` })
    || hasJsonKey({ targetFile: 'package.json', jsonKey: `devDependencies.nuxt-spec` })
  if (!isInstalled) {
    console.error(`[Nuxt Spec] 'nuxt-spec' was not found in your 'package.json'. Run the 'setup' command first.`)
    process.exit(1)
  }

  const isAutoRun = autoRun || await promptUser({ question: '[Nuxt Spec] Do you want to update everything automatically (no more prompts)?' })
  showMessage({ message: '' })

  // 1) run 'update nuxt-spec'
  const updateCmd = getUpdateCmd(packageManager, `nuxt-spec@${SPEC_VERSION}`)
  const runUpdate = isAutoRun || await promptUser({ question: `[Nuxt Spec] This will bump 'nuxt-spec' to version '${SPEC_VERSION}' by running \`${updateCmd}\`. Continue?` })
  if (runUpdate) {
    try {
      showMessage({ message: `Running \`${updateCmd}\`...` })
      execSync(updateCmd, { stdio: 'inherit' })
    } catch (error) {
      console.error(`[Nuxt Spec] Error running \`${updateCmd}\`:\n`, error.message)
    }
  }

  // 2) run 'nuxt prepare'
  const prepareCmd = getPrepareCmd(packageManager)
  const runPrepare = isAutoRun || await promptUser({ question: `[Nuxt Spec] Nuxt types and auto-imports should be regenerated after the update. Do you want to run \`${prepareCmd}\` now?` })
  if (runPrepare) {
    try {
      showMessage({ message: `Running \`${prepareCmd}\`...` })
      execSync(prepareCmd, { stdio: 'inherit' })
    } catch (error) {
      console.error(`[Nuxt Spec] Error running \`${prepareCmd}\`:\n`, error.message)
    }
  }

  // 3) run 'playwright install'
  const playwrightUpdateCmd = getPlaywrightInstallCmd(packageManager)
  const runPlaywrightUpdate = isAutoRun || await promptUser({ question: `[Nuxt Spec] Playwright browser runtimes might need to be updated for e2e tests. Do you want to run \`${playwrightUpdateCmd}\` now?` })
  if (runPlaywrightUpdate) {
    try {
      showMessage({ message: `Running \`${playwrightUpdateCmd}\`...` })
      execSync(playwrightUpdateCmd, { stdio: 'inherit' })
    } catch (error) {
      console.error(`[Nuxt Spec] Error running \`${playwrightUpdateCmd}\`:\n`, error.message)
    }
  }

  // 4) bump Playwright container image in CI workflow files
  const outdatedCiFiles = []
  const ciFiles = Object.values(CI_TEMPLATES).flat()
    .map(({ targetFile }) => targetFile)
    .filter(targetFile => pathExists({ targetPath: targetFile }))
  for (const targetFile of ciFiles) {
    try {
      const content = readFileSync(targetFile, 'utf8')
      const bumped = content.replace(PLAYWRIGHT_IMAGE_REGEX, `$1${PLAYWRIGHT_VERSION}`)
      if (bumped === content) {
        continue
      }
      const runBump = isAutoRun || await promptUser({ question: `[Nuxt Spec] This will bump the Playwright container image in '${targetFile}' to version '${PLAYWRIGHT_VERSION}'. Continue?` })
      if (runBump) {
        writeFileSync(targetFile, bumped)
        showMessage({ message: `Playwright container image in '${targetFile}' bumped to version '${PLAYWRIGHT_VERSION}'.` })
      } else {
        outdatedCiFiles.push(targetFile)
      }
    } catch (error) {
      console.error(`[Nuxt Spec] Error bumping Playwright container image in '${targetFile}':\n`, error.message)
    }
  }

  // 5) inform user
  showMessage({ message: '' })
  showMessage({ message: 'NUXT SPEC UPDATE COMPLETE', linesAfter: 2 })
  if (!runUpdate) {
    showMessage({ message: `Run \`${updateCmd}\` to update 'nuxt-spec'.` })
  }
  if (!runPrepare) {
    showMessage({ message: `Run \`${prepareCmd}\` to regenerate the Nuxt types and auto-imports.` })
  }
  if (!runPlaywrightUpdate) {
    showMessage({ message: `Run \`${playwrightUpdateCmd}\` to update the Playwright browser runtimes for e2e tests.` })
  }
  for (const targetFile of outdatedCiFiles) {
    showMessage({ message: `Bump the Playwright container image in '${targetFile}' to version '${PLAYWRIGHT_VERSION}' to match the \`playwright\` dependency.` })
  }

  // force exit to prevent #20
  process.exit(0)
}
