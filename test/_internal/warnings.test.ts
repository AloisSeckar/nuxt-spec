// internal unit tests for "/config/utils/warnings.mjs"

import { describe, expect, test } from 'vitest'
import { addMessageFilters, onConsoleLog } from '../../config/utils/warnings.mjs'

describe('Test message filters', () => {
  test('should filter out built-in patterns', () => {
    expect(onConsoleLog('[Vue warn]: <Suspense> is an experimental feature')).toBe(false)
  })

  test('should keep unrelated messages', () => {
    expect(onConsoleLog('nuxt-spec-unrelated-message')).toBeUndefined()
  })

  test('should filter out user-defined patterns', () => {
    expect(onConsoleLog('xx nuxt-spec-custom-filter yy')).toBeUndefined()
    addMessageFilters(['nuxt-spec-custom-filter'])
    expect(onConsoleLog('xx nuxt-spec-custom-filter yy')).toBe(false)
  })

  test('should ignore empty patterns', () => {
    addMessageFilters([''])
    expect(onConsoleLog('nuxt-spec-unrelated-message')).toBeUndefined()
  })
})
