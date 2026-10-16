#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createInterface } from 'node:readline'

// publishes `nuxt-spec` and `nuxt-spec-cli` together
// extra args are passed to `pnpm publish` (e.g. `--tag alpha`)

const readVersion = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')).version
const specVersion = readVersion('../package.json')
const cliVersion = readVersion('../cli/package.json')
if (specVersion !== cliVersion) {
  console.error(`Publish aborted. Versions of 'nuxt-spec' (${specVersion}) and 'nuxt-spec-cli' (${cliVersion}) must match.`)
  process.exit(1)
}

const rl = createInterface({ input: process.stdin, output: process.stdout })

rl.question(`Are you sure the current solution (v${specVersion}) was properly tested and verified? (y/n) `, (answer) => {
  rl.close()
  if (!answer.trim().toLowerCase().startsWith('y')) {
    console.error('Publish aborted. Please run the tests and try again.')
    process.exit(1)
  }
  console.log('Proceeding with publish...')
  const result = spawnSync('pnpm', ['-r', 'publish', ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, NUXT_SPEC_RELEASE: 'true' },
  })
  process.exit(result.status ?? 1)
})
