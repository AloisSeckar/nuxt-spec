#!/usr/bin/env node

import { getCmd } from './helpers/commands.js'

/**
 * CLI tool to scaffold necessary adjustments in project folder.
 *
 * Allows `setup` or `update` to be passed as parameter.
 *
 * Second parameter might be a boolean to indicate auto mode
 * (no prompts, force = true) or manual mode (with prompts, force = false).
 */

// get parameters passed by user
const args = process.argv.slice(2);

// execute actions based on first param
// additional params might be passed into the called functions
(async () => {
  let status = 0
  try {
    switch (args[0]) {
      case 'setup':
        await (await import('./setup.js')).specSetup(args[1] || false)
        break
      case 'update':
        await (await import('./update.js')).specUpdate(args[1] || false)
        break
      default:
        console.log(`Usage: \`${getCmd()} setup [true|false]\` or \`${getCmd()} update [true|false]\``)
        status = 1
    }
  } catch (error) {
    console.error('Setup failed:', error.message)
    status = 1
  }
  process.exit(status)
})()
