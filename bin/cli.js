#!/usr/bin/env node

import { getCmd, resolvePackageManager } from './helpers/commands.js'

/**
 * CLI tool to scaffold necessary adjustments in project folder.
 *
 * Allows `setup` or `update` to be passed as parameter.
 *
 * Second (optional) parameter might be a boolean to indicate auto mode
 * (no prompts, force = true) or manual mode (with prompts, force = false).
 *
 * Third (optional) parameter allows explicitly passing the package manager
 * (`npm`, `pnpm`, `yarn`, `bun` or `deno`), bypassing auto-detection.
 */

// get parameters passed by user
const args = process.argv.slice(2);

// execute actions based on first param
// additional params might be passed into the called functions
(async () => {
  let status = 0
  try {
    const packageManager = resolvePackageManager(args[2])
    // CLI args are always strings, so 'false' must be parsed explicitly rather than treated as truthy
    const autoRun = args[1] === 'true'
    switch (args[0]) {
      case 'setup':
        await (await import('./setup.js')).specSetup(autoRun, packageManager)
        break
      case 'update':
        await (await import('./update.js')).specUpdate(autoRun, packageManager)
        break
      default:
        console.log(`Usage: \`${getCmd(packageManager)} setup [true|false] [npm|pnpm|yarn|bun|deno]\` or \`${getCmd(packageManager)} update [true|false] [npm|pnpm|yarn|bun|deno]\``)
        status = 1
    }
  } catch (error) {
    console.error('nuxt-spec CLI failed:', error.message)
    status = 1
  }
  process.exit(status)
})()
