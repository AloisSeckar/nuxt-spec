#!/usr/bin/env node

/**
 * CLI tool to scaffold necessary adjustments in project folder.
 * 
 * Currently only allows `setup` to be passed as parameter.
 * 
 * Second parameter for `setup` might be a boolean to indicate auto mode 
 * (no prompts, force = true) or manual mode (with prompts, force = false).
 */

const args = process.argv.slice(2);

(async () => {
  switch (args[0]) {
    case 'setup':
      await (await import('./setup.js')).specSetup(args[1] || false);
      break;
    default:
      console.log('Usage: `npx nuxt-spec setup [true|false]`');
      process.exit(args.length ? 1 : 0);
  }
})();
