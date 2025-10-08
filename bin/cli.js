#!/usr/bin/env node

import { getPackageManager } from 'elrh-cosca'

/**
 * CLI tool to scaffold necessary adjustments in project folder.
 * 
 * Currently only allows `setup` to be passed as parameter.
 * 
 * Second parameter for `setup` might be a boolean to indicate auto mode 
 * (no prompts, force = true) or manual mode (with prompts, force = false).
 */

// get parameters passed by user
const args = process.argv.slice(2)

// execute actions based on first param
// additional params might be passed into the called functions
(async () => {
  switch (args[0]) {
    case 'setup':
      await (await import('./setup.js')).specSetup(args[1] || false)
      break;
    default:
      console.log(`Usage: \`${getCmd()} nuxt-spec setup [true|false]\``)
      process.exit(args.length ? 1 : 0)
  }
})()

// try detecting what package manager was used
// to give user apropriate usage hint
function getCmd() {
  const packageManager = getPackageManager()
  switch (packageManager) {
    case 'pnpm':
      return 'pnpx'
    case 'yarn':
      return 'yarn dlx'
    case 'bun':
      return 'bunx'
    case 'deno':
      return 'deno run --allow-run npm:npx'
    default:
      return 'npx'
  }
}
