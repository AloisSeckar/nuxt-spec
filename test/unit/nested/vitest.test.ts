// this is same file as ../vitest.test.ts )
// here we ensure it is being picked up from nested folder
// see https://github.com/AloisSeckar/nuxt-spec/issues/26

import { expect, test } from 'vitest'

test('vitest should run in /test/unit/nested', () => {
  expect(1).toBe(1)
})
