#!/usr/bin/env node

// CLI tool to scaffold default `vitest.config.ts` file
// and to add test-related commands in `package.json`
// usage: `npx spec-setup.js` in target folder

import { createFileFromTemplate } from './utils/create-file.js'
import { updatePackageJsonScripts } from './utils/modify-scripts.js'

async function main() {
  // 1) create vitest.config.ts
  await createFileFromTemplate('../vitest.config.ts', 'vitest.config.ts')

  // 2) modify scripts in package.json
  await updatePackageJsonScripts({
    'test': 'vitest run',
    'test-u': 'vitest run -u',
    'test-i': 'vitest',
  })
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
