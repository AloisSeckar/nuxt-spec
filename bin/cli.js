#!/usr/bin/env node

import { getCmd, resolvePackageManager } from './helpers/commands.js'

/**
 * CLI tool to scaffold necessary adjustments in project folder.
 *
 * Allows `setup`, `update` or `ci` to be passed as parameter.
 *
 * `ci` requires the target Git host (`github` or `gitlab`) as the next parameter,
 * the remaining optional parameters are shifted by one position (package manager is not used yet).
 *
 * Next (optional) parameter might be a boolean to indicate auto mode
 * (no prompts, force = true) or manual mode (with prompts, force = false).
 *
 * Next (optional) parameter allows explicitly passing the package manager
 * (`npm`, `pnpm`, `yarn`, `bun` or `deno`), bypassing auto-detection.
 */

// get parameters passed by user
const args = process.argv.slice(2);

// execute actions based on first param
// additional params might be passed into the called functions
(async () => {
  let status = 0
  try {
    const command = args[0]
    const host = command === 'ci' ? args[1] : undefined
    const [autoRunArg, packageManagerArg] = args.slice(command === 'ci' ? 2 : 1)
    const packageManager = resolvePackageManager(packageManagerArg)
    // CLI args are always strings, so 'false' must be parsed explicitly rather than treated as truthy
    const autoRun = autoRunArg === 'true'
    switch (command) {
      case 'setup':
        await (await import('./commands/setup.js')).specSetup(autoRun, packageManager)
        break
      case 'update':
        await (await import('./commands/update.js')).specUpdate(autoRun, packageManager)
        break
      case 'ci':
        await (await import('./commands/ci.js')).specCi(host, autoRun)
        break
      default:
        console.log(`[Nuxt Spec] Usage: \`${getCmd(packageManager)} setup [true|false] [npm|pnpm|yarn|bun|deno]\`, \`${getCmd(packageManager)} update [true|false] [npm|pnpm|yarn|bun|deno]\` or \`${getCmd(packageManager)} ci <github|gitlab> [true|false]\``)
        status = 1
    }
  } catch (error) {
    console.error('[Nuxt Spec] CLI failed:', error.message)
    status = 1
  }
  process.exit(status)
})()
