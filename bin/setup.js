#!/usr/bin/env node

import { promptUser, showMessage } from 'elrh-cosca'

/**
 * CLI tool to scaffold necessary adjustments in project folder.
 *
 * It first asks whether to run in "auto" mode (no prompts, force = true) or "manual" mode (with prompts, force = false).
 *
 * Then it:
 *  1) adds `nuxt-spec` into `package.json` dependencies and removes `nuxt`, `vue` and `vue-router` if present
 *  2) adds `extends: ['nuxt-spec']` to `nuxt.config.ts`
 *  3) creates/updates `.npmrc` file
 *  4) creates default `vitest.config.ts` file
 *  5) adds test-related scripts in `package.json`
 *  6) clear node_modules and lock file(s)
 */
export async function specSetup() {
  showMessage('NUXT SPEC SETUP')
  showMessage('This CLI tool will help you include Nuxt Spec in your project.')
  showMessage('Refer to the documentation for more information.', 2)

  const shouldDoAuto = await promptUser('Do you want to set everything up automatically (no more prompts)?')
  showMessage('')

  if (shouldDoAuto) {
    const { specSetupAuto } = await import('./setup-auto.js')
    await specSetupAuto()
  } else {
    const { specSetupManual } = await import('./setup-manual.js')
    await specSetupManual()
  }
}
