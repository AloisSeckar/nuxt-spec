// this test file ensures files directly inside "/test" are being picked up
// test env is set to 'node'

import { expect, test } from 'vitest'

test('vitest should run in /test', () => {
  expect(1).toBe(1)
})
