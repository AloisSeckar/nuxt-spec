#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { runCmd } from '../cli/helpers/run.js'

// publishes `nuxt-spec` and `nuxt-spec-cli` together
// extra args are passed to `<pm> publish` (e.g. `--tag alpha`)
// the package manager defaults to `pnpm` and can be overridden with `--pm <name>`

const args = process.argv.slice(2)
let packageManager = 'pnpm'
const pmIndex = args.indexOf('--pm')
if (pmIndex !== -1) {
  const value = args[pmIndex + 1]
  if (!value) {
    console.error('Publish aborted. Option \'--pm\' requires a package manager name.')
    process.exit(1)
  }
  packageManager = value
  args.splice(pmIndex, 2)
}

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

  // pnpm publish reads pnpm-workspace.yaml to get projects
  // npm must explicitly list projects to release
  const runs = packageManager === 'pnpm'
    ? [{ args: ['-r', 'publish', ...args], cwd: undefined }]
    : ['..', '../cli'].map(dir => ({ args: ['publish', ...args], cwd: new URL(dir, import.meta.url) }))

  for (const run of runs) {
    try {
      runCmd([packageManager, ...run.args].join(' '), {
        cwd: run.cwd,
        env: { ...process.env, NUXT_SPEC_RELEASE: 'true' },
      })
    } catch (error) {
      console.error(error.message)
      process.exit(error.status ?? 1)
    }
  }
})
