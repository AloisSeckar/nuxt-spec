#!/usr/bin/env node

import { createFileFromWebTemplate, updateConfigFile, updateJsonFile } from 'elrh-cosca'

/**
 * CLI tool to scaffold necessary adjustments in project folder.
 * This is the "auto" version running with supressed prompts (force = true).
 * @see `bin/setup.js` for details
 */
export async function specSetupAuto() {
  // 1) add dependency to package.json
  await updateJsonFile('package.json', 'dependencies', {
    'nuxt-spec': '0.1.8',
  }, true)

  // 2) modify nuxt.config.ts
  await updateConfigFile('nuxt.config.ts', {
    extends: [
      'nuxt-spec',
    ],
  }, true)

  // 3) .npmrc file
  await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/heads/main/.npmrc', '.npmrc', true)

  // 4) create vitest.config.ts
  await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/heads/main/config/vitest.config.ts.template', 'vitest.config.ts', true)

  // 5) modify scripts in package.json
  await updateJsonFile('package.json', 'scripts', {
    'test': 'vitest run',
    'test-u': 'vitest run -u',
    'test-i': 'vitest',
  }, true)
}
