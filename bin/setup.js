#!/usr/bin/env node

import { 
  createFileFromWebTemplate, deletePath, fileExists, hasJsonKey, promptUser,
  removeFromJsonFile, showMessage, updateConfigFile, updateJsonFile, updateTextFile,
} from 'elrh-cosca'

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

  const isAutoRun = await promptUser('Do you want to set everything up automatically (no more prompts)?')
  showMessage('')

  // 1) manage dependencies in package.json

  // add nuxt-spec
  await updateJsonFile('package.json', 'dependencies', {
    'nuxt-spec': '0.1.9',
  }, isAutoRun, 'This will add \'nuxt-spec\' dependency to your \'package.json\'. Continue?')

  // remove now obsolete nuxt, vue and vue-router
  const removeDeps = isAutoRun || await promptUser('As \'nuxt-spec\' provides \'nuxt\', \'vue\' and \'vue-router\' dependencies out of the box, do you want to remove them from your \'package.json\' to avoid duplications and possible version clashes?')
  if (removeDeps) {
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
  }

  // 2) modify nuxt.config.ts
  await updateConfigFile('nuxt.config.ts', {
    extends: [
      'nuxt-spec',
    ],
  }, isAutoRun, 'This will add \'nuxt-spec\' module to your \'nuxt.config.ts\'. Continue?')

  // 3) .npmrc file
  if (fileExists('.npmrc')) {
    await updateTextFile('.npmrc', ['shamefully-hoist=true'], isAutoRun, 'This will adjust \'.npmrc\' file in your project. Continue?')
  } else {
    await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/heads/main/.npmrc',
      '.npmrc', isAutoRun, 'This will add \'.npmrc\' file for your project. Continue?')
  }

  // 4) create vitest.config.ts
  await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/heads/main/config/vitest.config.ts.template',
    'vitest.config.ts', isAutoRun, 'This will create a new \'vitest.config.ts\' file for your project. Continue?')

  // 5) modify scripts in package.json
  await updateJsonFile('package.json', 'scripts', {
    'test': 'vitest run',
    'test-u': 'vitest run -u',
    'test-i': 'vitest',
  }, isAutoRun, 'This will adjust the test-related commands in your \'package.json\'. Continue?')

  // 6) clear node_modules and lock file(s)
  const prepareForReinstall = isAutoRun || await promptUser('Dependencies should be re-installed now. Do you want to remove node_modules and the lock file?')
  if (prepareForReinstall) {
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
}
