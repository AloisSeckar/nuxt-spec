#!/usr/bin/env node

import { createFileFromWebTemplate, updateConfigFile, updateJsonFile } from 'elrh-cosca'

/**
 * CLI tool to scaffold necessary adjustments in project folder.
 * This is the "manual" version running with prompts for each action (force = false).
 * @see `bin/setup.js` for details
 */
export async function specSetupManual() {
  // 1) add dependency to package.json
  await updateJsonFile('package.json', 'dependencies', {
    'nuxt-spec': '0.1.8',
  }, false, 'This will add \'nuxt-spec\' dependency to your \'package.json\'. Continue?')

  // 2) modify nuxt.config.ts
  await updateConfigFile('nuxt.config.ts', {
    extends: [
      'nuxt-spec',
    ],
  }, false, 'This will add \'nuxt-spec\' module to your \'nuxt.config.ts\'. Continue?')

  // 3) .npmrc file
  await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/heads/main/.npmrc',
    '.npmrc', false, 'This will adjust \'.npmrc\' file for your project. Continue?')

  // 4) create vitest.config.ts
  await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/heads/main/config/vitest.config.ts.template',
    'vitest.config.ts', false, 'This will create a new \'vitest.config.ts\' file for your project. Continue?')

  // 5) modify scripts in package.json
  await updateJsonFile('package.json', 'scripts', {
    'test': 'vitest run',
    'test-u': 'vitest run -u',
    'test-i': 'vitest',
  }, false, 'This will adjust the test-related commands in your \'package.json\'. Continue?')
}
