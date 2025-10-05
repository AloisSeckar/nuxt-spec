#!/usr/bin/env node

import {
  createFileFromWebTemplate, deletePath, fileExists, hasJsonKey,
  removeFromJsonFile, updateConfigFile, updateJsonFile, updateTextFile,
} from 'elrh-cosca'

/**
 * CLI tool to scaffold necessary adjustments in project folder.
 * This is the "auto" version running with supressed prompts (force = true).
 * @see `bin/setup.js` for details
 */
export async function specSetupAuto() {
  // 1) manage dependencies in package.json

  // add nuxt-spec
  await updateJsonFile('package.json', 'dependencies', {
    'nuxt-spec': '0.1.9',
  }, true)

  // remove now obsolete nuxt, vue and vue-router (if they are present)
  if (hasJsonKey('package.json', 'dependencies.nuxt')) {
    await removeFromJsonFile('package.json', 'dependencies.nuxt', true)
  }
  if (hasJsonKey('package.json', 'dependencies.vue')) {
    await removeFromJsonFile('package.json', 'dependencies.vue', true)
  }
  if (hasJsonKey('package.json', 'dependencies.vue-router')) {
    await removeFromJsonFile('package.json', 'dependencies.vue-router', true)
  }
  if (hasJsonKey('package.json', 'devDependencies.nuxt')) {
    await removeFromJsonFile('package.json', 'devDependencies.nuxt', true)
  }
  if (hasJsonKey('package.json', 'devDependencies.vue')) {
    await removeFromJsonFile('package.json', 'devDependencies.vue', true)
  }
  if (hasJsonKey('package.json', 'devDependencies.vue-router')) {
    await removeFromJsonFile('package.json', 'devDependencies.vue-router', true)
  }

  // 2) modify nuxt.config.ts
  await updateConfigFile('nuxt.config.ts', {
    extends: [
      'nuxt-spec',
    ],
  }, true)

  // 3) .npmrc file
  if (fileExists('.npmrc')) {
    await updateTextFile('.npmrc', ['shamefully-hoist=true'], true)
  } else {
    await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/heads/main/.npmrc', '.npmrc', true)
  }

  // 4) create vitest.config.ts
  await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/heads/main/config/vitest.config.ts.template', 'vitest.config.ts', true)

  // 5) modify scripts in package.json
  await updateJsonFile('package.json', 'scripts', {
    'test': 'vitest run',
    'test-u': 'vitest run -u',
    'test-i': 'vitest',
  }, true)

  // 6) clear node_modules and lock file(s)
  await deletePath('node_modules', true)
  if (fileExists('package-lock.json')) {
    await deletePath('package-lock.json', true)
  }
  if (fileExists('pnpm-lock.yaml')) {
    await deletePath('pnpm-lock.yaml', true)
  }
  if (fileExists('yarn.lock')) {
    await deletePath('yarn.lock', true)
  }
  if (fileExists('bun.lockb')) {
    await deletePath('bun.lockb', true)
  }
}
