#!/usr/bin/env node

// CLI tool to scaffold necessary adjustments in project folder:
//
// 1) create default `vitest.config.ts` file
// 2) add `extends: ['nuxt-spec']` to `nuxt.config.ts`
// 3) create .npmrc file
// 4) modify scripts in `package.json`
//
// usage: `npx spec-setup.js` in target folder

import { promptUser, showMessage } from 'elrh-cosca'

export async function specSetup() {
  showMessage('NUXT SPEC SETUP')
  showMessage('This CLI tool will help you include Nuxt Spec in your project.')
  showMessage('Refer to the documentation for more information.', 2)

  const shouldDoAuto = await promptUser('Do you want to set everything up automatically (no more prompts)?')
  showMessage('')

  if (shouldDoAuto) {
    const { specSetupAuto } = await import('./spec-setup-auto.js')
    await specSetupAuto()
  } else {
    const { specSetupManual } = await import('./spec-setup-manual.js')
    await specSetupManual()
  }
}

specSetup().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
