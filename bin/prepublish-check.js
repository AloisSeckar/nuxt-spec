#!/usr/bin/env node

import { createInterface } from 'node:readline'

const rl = createInterface({ input: process.stdin, output: process.stdout })

rl.question('Are you sure the current solution was properly tested and verified? (y/n) ', (answer) => {
  rl.close()
  if (answer.trim().toLowerCase().startsWith('y')) {
    console.log('Proceeding with publish...')
    process.exit(0)
  } else {
    console.error('Publish aborted. Please run the tests and try again.')
    process.exit(1)
  }
})
