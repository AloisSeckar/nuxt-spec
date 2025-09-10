#!/usr/bin/env node

// CLI tool to scaffold necessary adjustments:
// 1) create default `vitest.config.ts` file
// 2) add `extends: ['nuxt-spec']` to `nuxt.config.ts`
// 3) create .npmrc file
// 4) modify scripts in `package.json`
// usage: `npx spec-setup.js` in target folder

// "auto" version runs with supressed prompts (force = true)

import { createFileFromWebTemplate, updateConfigFile, updateJsonFile } from 'elrh-cosca'

export async function specSetupAuto() {
  // 1) create vitest.config.ts
  await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/heads/main/config/vitest.config.ts.template', 'vitest.config.ts', true)

  // 2) modify nuxt.config.ts
  await updateConfigFile('nuxt.config.ts', {
    extends: [
      'nuxt-spec',
    ],
  }, true)

  // 3) .npmrc file
  await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/heads/main/.npmrc', '.npmrc', true)

  // 4) modify scripts in package.json
  await updateJsonFile('package.json', 'scripts', {
    'test': 'vitest run',
    'test-u': 'vitest run -u',
    'test-i': 'vitest',
  }, true)
}
