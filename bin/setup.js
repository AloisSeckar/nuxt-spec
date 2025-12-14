#!/usr/bin/env node

import {
  createFileFromWebTemplate, deletePath, getPackageManager, hasJsonKey,
  pathExists, promptUser, removeFromJsonFile, showMessage,
  updateConfigFile, updateJsonFile, updateTextFile,
} from 'elrh-cosca'

/**
 * CLI tool to scaffold necessary adjustments in project folder.
 *
 * It first asks whether to run in "auto" mode (no prompts, force = true) or "manual" mode (with prompts, force = false).
 *
 * Then it:
 *  1) adds `nuxt-spec` into `package.json` dependencies and removes `nuxt`, `vue` and `vue-router` if present
 *  2) adds `extends: ['nuxt-spec']` to `nuxt.config.ts`
 *  3) creates/updates `.npmrc` file (only if pnpm is used)
 *  4) creates default `vitest.config.ts` file
 *  5) adds test-related scripts and pnpm approved build scripts (if using pnpm) in `package.json`
 *  6) creates sample test files
 *  7) clear node_modules and lock file(s)
 *
 * @param {boolean} autoRun - Whether to run the setup automatically without any prompts (defaults to false).
 */
export async function specSetup(autoRun = false) {
  showMessage('NUXT SPEC SETUP')
  showMessage('This CLI tool will help you include Nuxt Spec in your project.')
  showMessage('Refer to the documentation for more information.', 2)

  const isAutoRun = autoRun || await promptUser('Do you want to set everything up automatically (no more prompts)?')
  showMessage('')

  const packageManager = getPackageManager()

  // 1) manage dependencies in package.json

  // add nuxt-spec
  try {
    await updateJsonFile('package.json', 'dependencies', {
      'nuxt-spec': '0.1.16',
    }, isAutoRun, 'This will add \'nuxt-spec\' dependency to your \'package.json\'. Continue?')
  } catch (error) {
    console.error('Error adding \'nuxt-spec\' dependency:\n', error.message)
  }

  // remove now obsolete nuxt, vue and vue-router
  const removeDeps = isAutoRun || await promptUser('As \'nuxt-spec\' provides \'nuxt\', \'vue\' and \'vue-router\' dependencies out of the box, do you want to remove them from your \'package.json\' to avoid duplications and possible version clashes?')
  if (removeDeps) {
    if (hasJsonKey('package.json', 'dependencies.nuxt')) {
      try {
        await removeFromJsonFile('package.json', 'dependencies.nuxt', true)
      } catch (error) {
        console.error('Error removing \'nuxt\' dependency:\n', error.message)
      }
    }
    if (hasJsonKey('package.json', 'dependencies.vue')) {
      try {
        await removeFromJsonFile('package.json', 'dependencies.vue', true)
      } catch (error) {
        console.error('Error removing \'vue\' dependency:\n', error.message)
      }
    }
    if (hasJsonKey('package.json', 'dependencies.vue-router')) {
      try {
        await removeFromJsonFile('package.json', 'dependencies.vue-router', true)
      } catch (error) {
        console.error('Error removing \'vue-router\' dependency:\n', error.message)
      }
    }
    if (hasJsonKey('package.json', 'devDependencies.nuxt')) {
      try {
        await removeFromJsonFile('package.json', 'devDependencies.nuxt', true)
      } catch (error) {
        console.error('Error removing \'nuxt\' devDependency:\n', error.message)
      }
    }
    if (hasJsonKey('package.json', 'devDependencies.vue')) {
      try {
        await removeFromJsonFile('package.json', 'devDependencies.vue', true)
      } catch (error) {
        console.error('Error removing \'vue\' devDependency:\n', error.message)
      }
    }
    if (hasJsonKey('package.json', 'devDependencies.vue-router')) {
      try {
        await removeFromJsonFile('package.json', 'devDependencies.vue-router', true)
      } catch (error) {
        console.error('Error removing \'vue-router\' devDependency:\n', error.message)
      }
    }
  }

  // 2) modify nuxt.config.ts
  try {
    await updateConfigFile('nuxt.config.ts', {
      extends: [
        'nuxt-spec',
      ],
    }, isAutoRun, 'This will add \'nuxt-spec\' module to your \'nuxt.config.ts\'. Continue?')
  } catch (error) {
    console.error('Error updating \'nuxt.config.ts\':\n', error.message)
  }

  // 3) .npmrc file (only if pnpm is used)
  if (packageManager === 'pnpm') {
    try {
      if (pathExists('.npmrc')) {
        await updateTextFile('.npmrc', ['shamefully-hoist=true'], isAutoRun, 'This will adjust \'.npmrc\' file in your project. Continue?')
      } else {
        await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/tags/v0.1.16/.npmrc',
          '.npmrc', isAutoRun, 'This will add \'.npmrc\' file for your project. Continue?')
      }
    } catch (error) {
      console.error('Error setting up \'.npmrc\':\n', error.message)
    }
  }

  // 4) create vitest.config.ts
  try {
    await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/tags/v0.1.16/config/vitest.config.ts.template',
      'vitest.config.ts', isAutoRun, 'This will create a new \'vitest.config.ts\' file for your project. Continue?')
  } catch (error) {
    console.error('Error setting up \'vitest.config.ts\':\n', error.message)
  }

  // 5) modify package.json

  // add test scripts
  try {
    await updateJsonFile('package.json', 'scripts', {
      'test': 'vitest run',
      'test-u': 'vitest run -u',
      'test-i': 'vitest',
    }, isAutoRun, 'This will adjust the test-related commands in your \'package.json\'. Continue?')
  } catch (error) {
    console.error('Error adjusting scripts in \'package.json\':\n', error.message)
  }

  // add pnpm approved build scripts
  if (packageManager === 'pnpm') {
    try {
      await updateJsonFile('package.json', 'pnpm', {
        onlyBuiltDependencies: [
          '@parcel/watcher',
          'esbuild',
          'unrs-resolver',
        ],
      }, isAutoRun, 'This will adjust pnpm approved build scripts in your \'package.json\'. Continue?')
    } catch (error) {
      console.error('Error adjusting pnpm approved build scripts in \'package.json\':\n', error.message)
    }
  }

  // 6) create sample test files
  const createSampleTests = isAutoRun || await promptUser('Do you want to create sample tests in \'/test\' folder?')
  if (createSampleTests) {
    try {
      await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/tags/v0.1.16/test/e2e/nuxt-e2e.test.ts',
        'test/e2e/nuxt-e2e.test.ts', true)
    } catch (error) {
      console.error('Error setting up \'nuxt-e2e.test.ts\':\n', error.message)
    }
    try {
      await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/tags/v0.1.16/test/nuxt/nuxt-unit.test.ts',
        'test/nuxt/nuxt-unit.test.ts', true)
    } catch (error) {
      console.error('Error setting up \'nuxt-unit.test.ts\':\n', error.message)
    }
    try {
      await createFileFromWebTemplate('https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/tags/v0.1.16/test/unit/vitest.test.ts',
        'test/unit/vitest.test.ts', true)
    } catch (error) {
      console.error('Error setting up \'vitest.test.ts\':\n', error.message)
    }
  }

  // 7) clear node_modules and lock file(s)
  const prepareForReinstall = isAutoRun || await promptUser('Dependencies should be re-installed now. Do you want to remove node_modules and the lock file?')
  if (prepareForReinstall) {
    if (pathExists('node_modules')) {
      try {
        await deletePath('node_modules', true)
      } catch (error) {
        console.error('Error deleting \'node_modules\':\n', error.message)
      }
    }
    if (pathExists('package-lock.json')) {
      try {
        await deletePath('package-lock.json', true)
      } catch (error) {
        console.error('Error deleting \'package-lock.json\':\n', error.message)
      }
    }
    if (pathExists('pnpm-lock.yaml')) {
      try {
        await deletePath('pnpm-lock.yaml', true)
      } catch (error) {
        console.error('Error deleting \'pnpm-lock.yaml\':\n', error.message)
      }
    }
    if (pathExists('yarn.lock')) {
      try {
        await deletePath('yarn.lock', true)
      } catch (error) {
        console.error('Error deleting \'yarn.lock\':\n', error.message)
      }
    }
    if (pathExists('bun.lockb')) {
      try {
        await deletePath('bun.lockb', true)
      } catch (error) {
        console.error('Error deleting \'bun.lockb\':\n', error.message)
      }
    }
    if (pathExists('deno.lock')) {
      try {
        await deletePath('deno.lock', true)
      } catch (error) {
        console.error('Error deleting \'deno.lock\':\n', error.message)
      }
    }
  }

  // 7) inform user
  showMessage('')
  showMessage('NUXT SPEC SETUP COMPLETE', 2)
  showMessage(`Proceed with \`${packageManager} install\` to get started.`)

  // force exit to prevent #20
  process.exit(0)
}
