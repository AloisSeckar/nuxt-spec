#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import {
  createFileFromWebTemplate, deletePath,
  pathExists, promptUser, removeFromJsonFile, showMessage,
  updateConfigFile, updateJsonFile, updateTextFile,
} from 'elrh-cosca'
import {
  getPlaywrightInstallCmd, getPrepareCmd,
} from './helpers/commands.js'

const TARGET_VERSION = '0.3.4'

/**
 * CLI tool to scaffold necessary adjustments in project folder.
 *
 * It first asks whether to run in "auto" mode (no prompts, force = true) or "manual" mode (with prompts, force = false).
 *
 * Then it:
 *  1) adds `nuxt-spec` into `package.json` dependencies and removes `nuxt`, `vue` and `vue-router` if present
 *  2) adds `extends: ['nuxt-spec']` to `nuxt.config.ts`
 *  3) creates/updates `pnpm-workspace.yaml` file (only if pnpm is used)
 *  4) creates default `vitest.config.ts` file
 *  5) creates default `.nuxtrc` file
 *  6) adds test-related scripts in `package.json`
 *  7) creates sample test files
 *  8) adds nuxt-spec related entries to `.gitignore`
 *  9) clear node_modules and lock file(s)
 * 10) run install command
 * 11) run Nuxt prepare command to generate types and auto-imports
 * 12) run Playwright setup command
 *
 * @param {boolean} autoRun - Whether to run the setup automatically without any prompts (defaults to false).
 * @param {string} [packageManager] - Package manager to be used (`npm`, `pnpm`, `yarn`, `bun` or `deno`).
 */
export async function specSetup(autoRun = false, packageManager) {
  showMessage({ message: 'NUXT SPEC SETUP' })
  showMessage({ message: 'This CLI tool will help you include Nuxt Spec in your project.' })
  showMessage({ message: 'Refer to the documentation for more information.', linesAfter: 2 })

  const isAutoRun = autoRun || await promptUser({ question: '[Nuxt Spec] Do you want to set everything up automatically (no more prompts)?' })
  showMessage({ message: '' })

  // 1) manage dependencies in package.json

  // add nuxt-spec
  try {
    await updateJsonFile({
      targetFile: 'package.json',
      jsonKey: 'dependencies',
      patch: {
        ['nuxt-spec']: TARGET_VERSION,
      },
      force: isAutoRun,
      prompt: `[Nuxt Spec] This will add 'nuxt-spec' dependency to your 'package.json'. Continue?`,
    })
  } catch (error) {
    console.error(`[Nuxt Spec] Error adding 'nuxt-spec' dependency:\n`, error.message)
  }

  // remove now obsolete nuxt, vue and vue-router
  const removeDeps = isAutoRun || await promptUser({ question: `[Nuxt Spec] As 'nuxt-spec' provides 'nuxt', 'vue' and 'vue-router' dependencies out of the box, do you want to remove them from your 'package.json' to avoid duplications and possible version clashes?` })
  if (removeDeps) {
    try {
      await removeFromJsonFile({ targetFile: 'package.json', jsonKey: 'dependencies.nuxt', force: true })
    } catch (error) {
      console.error('[Nuxt Spec] Error removing \'nuxt\' dependency:\n', error.message)
    }
    try {
      await removeFromJsonFile({ targetFile: 'package.json', jsonKey: 'dependencies.vue', force: true })
    } catch (error) {
      console.error('[Nuxt Spec] Error removing \'vue\' dependency:\n', error.message)
    }
    try {
      await removeFromJsonFile({ targetFile: 'package.json', jsonKey: 'dependencies.vue-router', force: true })
    } catch (error) {
      console.error('[Nuxt Spec] Error removing \'vue-router\' dependency:\n', error.message)
    }
    try {
      await removeFromJsonFile({ targetFile: 'package.json', jsonKey: 'devDependencies.nuxt', force: true })
    } catch (error) {
      console.error('[Nuxt Spec] Error removing \'nuxt\' devDependency:\n', error.message)
    }
    try {
      await removeFromJsonFile({ targetFile: 'package.json', jsonKey: 'devDependencies.vue', force: true })
    } catch (error) {
      console.error('[Nuxt Spec] Error removing \'vue\' devDependency:\n', error.message)
    }
    try {
      await removeFromJsonFile({ targetFile: 'package.json', jsonKey: 'devDependencies.vue-router', force: true })
    } catch (error) {
      console.error('[Nuxt Spec] Error removing \'vue-router\' devDependency:\n', error.message)
    }
  }

  // 2) modify nuxt.config.ts
  try {
    await updateConfigFile({
      targetFile: 'nuxt.config.ts',
      newConfig: {
        extends: [
          'nuxt-spec',
        ],
      },
      force: isAutoRun,
      prompt: `[Nuxt Spec] This will add 'nuxt-spec' module to your 'nuxt.config.ts'. Continue?`,
    })
  } catch (error) {
    console.error('[Nuxt Spec] Error updating \'nuxt.config.ts\':\n', error.message)
  }

  // 3) `pnpm-workspace.yaml` file (only if pnpm is used)
  if (packageManager === 'pnpm') {
    try {
      if (pathExists({ targetPath: 'pnpm-workspace.yaml' })) {
        await updateTextFile({
          targetFile: 'pnpm-workspace.yaml',
          rowsToAdd: ['shamefullyHoist: true'],
          force: isAutoRun,
          prompt: '[Nuxt Spec] This will adjust \'pnpm-workspace.yaml\' file in your project. Continue?',
        })
      } else {
        await createFileFromWebTemplate({
          url: `https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/tags/v${TARGET_VERSION}/config/templates/pnpm-workspace.yaml.template`,
          targetFile: 'pnpm-workspace.yaml',
          force: isAutoRun,
          prompt: '[Nuxt Spec] This will add \'pnpm-workspace.yaml\' file for your project. Continue?',
        })
      }
    } catch (error) {
      console.error('[Nuxt Spec] Error setting up \'pnpm-workspace.yaml\':\n', error.message)
    }
  }

  // 4) create vitest.config.ts
  try {
    await createFileFromWebTemplate({
      url: `https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/tags/v${TARGET_VERSION}/config/templates/vitest.config.ts.template`,
      targetFile: 'vitest.config.ts',
      force: isAutoRun,
      prompt: '[Nuxt Spec] This will create a new \'vitest.config.ts\' file for your project. Continue?',
    })
  } catch (error) {
    console.error('[Nuxt Spec] Error setting up \'vitest.config.ts\':\n', error.message)
  }

  // 5) create .nuxtrc to prevent @nuxt/test-utils setup from running automatically on first start
  if (!pathExists({ targetPath: '.nuxtrc' })) {
    try {
      await createFileFromWebTemplate({
        url: `https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/tags/v${TARGET_VERSION}/.nuxtrc`,
        targetFile: '.nuxtrc',
        force: isAutoRun,
        prompt: '[Nuxt Spec] This will create a \'.nuxtrc\' file to prevent @nuxt/test-utils setup from running automatically when dev server starts. Continue?',
      })
    } catch (error) {
      console.error('[Nuxt Spec] Error creating \'.nuxtrc\':\n', error.message)
    }
  }

  // 6) modify package.json with test scripts
  try {
    await updateJsonFile({
      targetFile: 'package.json',
      jsonKey: 'scripts',
      patch: {
        'test': 'vitest run',
        'test-u': 'vitest run -u',
        'test-i': 'vitest',
      },
      force: isAutoRun,
      prompt: '[Nuxt Spec] This will adjust the test-related commands in your \'package.json\'. Continue?',
    })
  } catch (error) {
    console.error('[Nuxt Spec] Error adjusting scripts in \'package.json\':\n', error.message)
  }

  // 7) create sample test files
  const createSampleTests = isAutoRun || await promptUser({ question: '[Nuxt Spec] Do you want to create sample tests in \'/test\' folder?' })
  if (createSampleTests) {
    try {
      await createFileFromWebTemplate({
        url: `https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/tags/v${TARGET_VERSION}/test/browser/vitest-browser.test.ts`,
        targetFile: 'test/browser/vitest-browser.test.ts',
        force: true,
      })
    } catch (error) {
      console.error('[Nuxt Spec] Error setting up \'vitest-browser.test.ts\':\n', error.message)
    }
    try {
      await createFileFromWebTemplate({
        url: `https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/tags/v${TARGET_VERSION}/test/e2e/nuxt-e2e.test.ts`,
        targetFile: 'test/e2e/nuxt-e2e.test.ts',
        force: true,
      })
    } catch (error) {
      console.error('[Nuxt Spec] Error setting up \'nuxt-e2e.test.ts\':\n', error.message)
    }
    try {
      await createFileFromWebTemplate({
        url: `https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/tags/v${TARGET_VERSION}/test/e2e/nuxt-visual.test.ts`,
        targetFile: 'test/e2e/nuxt-visual.test.ts',
        force: true,
      })
    } catch (error) {
      console.error('[Nuxt Spec] Error setting up \'nuxt-visual.test.ts\':\n', error.message)
    }
    // pre-existing baseline ensures the sample "wrong" visual test fails as intended
    try {
      await createFileFromWebTemplate({
        url: `https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/tags/v${TARGET_VERSION}/test/e2e/__baseline__/wrong.png`,
        targetFile: 'test/e2e/__baseline__/wrong.png',
        force: true,
      })
    } catch (error) {
      console.error('[Nuxt Spec] Error setting up \'wrong.png\':\n', error.message)
    }
    try {
      await createFileFromWebTemplate({
        url: `https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/tags/v${TARGET_VERSION}/test/nuxt/nuxt-unit.test.ts`,
        targetFile: 'test/nuxt/nuxt-unit.test.ts',
        force: true,
      })
    } catch (error) {
      console.error('[Nuxt Spec] Error setting up \'nuxt-unit.test.ts\':\n', error.message)
    }
    try {
      await createFileFromWebTemplate({
        url: `https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/tags/v${TARGET_VERSION}/test/unit/vitest-unit.test.ts`,
        targetFile: 'test/unit/vitest-unit.test.ts',
        force: true,
      })
    } catch (error) {
      console.error('[Nuxt Spec] Error setting up \'vitest-unit.test.ts\':\n', error.message)
    }
  }

  // 8) add nuxt-spec related entries to .gitignore
  try {
    const gitignoreEntries = [
      ['# vitest output folder', '.vitest'],
      ['# nuxt-spec screenshots folder', '__current__'],
      ['# nuxt-spec HTML test reports folder', '__reports__'],
    ]
    // if .gitignore exists, we rather check for duplicates
    const gitignoreExists = pathExists({ targetPath: '.gitignore' })
    const gitignoreRows = gitignoreExists ? readFileSync('.gitignore', 'utf8').split(/\r?\n/) : []
    const rowsToAdd = gitignoreEntries
      .filter(([, entry]) => !gitignoreRows.includes(entry))
      .flatMap(([comment, entry]) => ['', comment, entry])
      .slice(gitignoreExists ? 0 : 1)
    //
    if (rowsToAdd.length > 0) {
      await updateTextFile({
        targetFile: '.gitignore',
        rowsToAdd,
        allowDuplicates: true,
        createMissing: true,
        force: isAutoRun,
        prompt: '[Nuxt Spec] This will add nuxt-spec related entries to your \'.gitignore\' file. Continue?',
      })
    }
  } catch (error) {
    console.error('[Nuxt Spec] Error updating \'.gitignore\':\n', error.message)
  }

  // 9) clear node_modules and lock file(s)
  const prepareForReinstall = isAutoRun || await promptUser({ question: '[Nuxt Spec] Dependencies should be re-installed now. Do you want to remove node_modules and the lock file?' })
  if (prepareForReinstall) {
    if (pathExists({ targetPath: 'node_modules' })) {
      try {
        await deletePath({ targetPath: 'node_modules', force: true })
      } catch (error) {
        console.error('[Nuxt Spec] Error deleting \'node_modules\':\n', error.message)
      }
    }
    if (pathExists({ targetPath: 'package-lock.json' })) {
      try {
        await deletePath({ targetPath: 'package-lock.json', force: true })
      } catch (error) {
        console.error('[Nuxt Spec] Error deleting \'package-lock.json\':\n', error.message)
      }
    }
    if (pathExists({ targetPath: 'pnpm-lock.yaml' })) {
      try {
        await deletePath({ targetPath: 'pnpm-lock.yaml', force: true })
      } catch (error) {
        console.error('[Nuxt Spec] Error deleting \'pnpm-lock.yaml\':\n', error.message)
      }
    }
    if (pathExists({ targetPath: 'yarn.lock' })) {
      try {
        await deletePath({ targetPath: 'yarn.lock', force: true })
      } catch (error) {
        console.error('[Nuxt Spec] Error deleting \'yarn.lock\':\n', error.message)
      }
    }
    if (pathExists({ targetPath: 'bun.lockb' })) {
      try {
        await deletePath({ targetPath: 'bun.lockb', force: true })
      } catch (error) {
        console.error('[Nuxt Spec] Error deleting \'bun.lockb\':\n', error.message)
      }
    }
    if (pathExists({ targetPath: 'deno.lock' })) {
      try {
        await deletePath({ targetPath: 'deno.lock', force: true })
      } catch (error) {
        console.error('[Nuxt Spec] Error deleting \'deno.lock\':\n', error.message)
      }
    }
  }

  // 10) run install command
  const runInstall = isAutoRun || await promptUser({ question: `[Nuxt Spec] Fresh \`${packageManager} install\` is required. Do you want to run it now?` })
  if (runInstall) {
    try {
      showMessage({ message: `Running \`${packageManager} install\`...` })
      execSync(`${packageManager} install`, { stdio: 'inherit' })
    } catch (error) {
      console.error(`[Nuxt Spec] Error running \`${packageManager} install\`:\n`, error.message)
    }
  }

  // 11) run Nuxt prepare command to generate types and auto-imports
  const prepareCmd = getPrepareCmd(packageManager)
  const runPrepare = isAutoRun || await promptUser({ question: `[Nuxt Spec] Nuxt needs to generate types and auto-imports before the project is fully usable. Do you want to run \`${prepareCmd}\` now?` })
  if (runPrepare) {
    try {
      showMessage({ message: `Running \`${prepareCmd}\`...` })
      execSync(prepareCmd, { stdio: 'inherit' })
    } catch (error) {
      console.error(`[Nuxt Spec] Error running \`${prepareCmd}\`:\n`, error.message)
    }
  }

  // 12) run Playwright browser install command
  const playwrightInstallCmd = getPlaywrightInstallCmd(packageManager)
  const runPlaywrightInstall = isAutoRun || await promptUser({ question: `[Nuxt Spec] Playwright browser runtimes might need to be installed locally for e2e tests. Do you want to run \`${playwrightInstallCmd}\` now?` })
  if (runPlaywrightInstall) {
    try {
      showMessage({ message: `Running \`${playwrightInstallCmd}\`...` })
      execSync(playwrightInstallCmd, { stdio: 'inherit' })
    } catch (error) {
      console.error(`[Nuxt Spec] Error running \`${playwrightInstallCmd}\`:\n`, error.message)
    }
  }

  // 13) inform user
  showMessage({ message: '' })
  showMessage({ message: 'NUXT SPEC SETUP COMPLETE', linesAfter: 2 })
  if (!runInstall) {
    showMessage({ message: `Proceed with \`${packageManager} install\` to install dependencies.` })
  }
  if (!runPrepare) {
    showMessage({ message: `Run \`${prepareCmd}\` to generate the required Nuxt types and auto-imports.` })
  }
  if (!runPlaywrightInstall) {
    showMessage({ message: `Run \`${playwrightInstallCmd}\` to setup the Playwright browser runtimes for e2e tests.` })
  }

  // force exit to prevent #20
  process.exit(0)
}
