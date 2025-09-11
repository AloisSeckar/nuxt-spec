#!/usr/bin/env node

// @see bin/spec-setup.js for details
// usage: `npx spec-setup.js` in target folder

import { createFileFromWebTemplate, updateConfigFile, updateJsonFile } from 'elrh-cosca'

export async function specSetupManual() {
  // 1) create vitest.config.ts
  await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/heads/main/config/vitest.config.ts.template', 'vitest.config.ts')

  // 2) modify nuxt.config.ts
  await updateConfigFile('nuxt.config.ts', {
    extends: [
      'nuxt-spec',
    ],
  })

  // 3) .npmrc file
  await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/heads/main/.npmrc', '.npmrc')

  // 4) modify scripts in package.json
  await updateJsonFile('package.json', 'scripts', {
    'test': 'vitest run',
    'test-u': 'vitest run -u',
    'test-i': 'vitest',
  })
}
