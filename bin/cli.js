#!/usr/bin/env node

/**
 * CLI tool to scaffold necessary adjustments in project folder.
 * Currently only allows `setup` to be passed as parameter.
 */

const args = process.argv.slice(2);

(async () => {
  switch (args[0]) {
    case 'setup':
      await (await import('./setup.js')).specSetup();
      break;
    default:
      console.log('Usage: `npx nuxt-spec setup`');
      process.exit(args.length ? 1 : 0);
  }
})();