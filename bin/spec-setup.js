#!/usr/bin/env node

// CLI tool to scaffold necessary adjustments:
// 1) create default `vitest.config.ts` file
// 2) add `extends: ['nuxt-spec']` to `nuxt.config.ts`
// 3) create .npmrc file
// 4) modify scripts in `package.json`
// usage: `npx spec-setup.js` in target folder

import { promptUser } from 'elrh-cosca'

export async function specSetup() {
  const shouldDoAuto = await promptUser('Do you want Nuxt Spec to set everything up automatically (no prompts)?')
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
