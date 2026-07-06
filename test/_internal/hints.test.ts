// unit tests for
// - utils\helpers\check-params.ts
// - utils\helpers\location-hint.ts

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { locationHint } from '../../utils/helpers/location-hint'
import { checkPageParam, checkStringParam } from '../../utils/helpers/check-params'

describe('Test `locationHint` function', () => {
  test('should be defined', () => {
    expect(locationHint).toBeDefined()
  })

  test('should locate this file', () => {
    const hint = locationHint()
    console.log('locationHint:', hint)
    expect(hint).toContain('_internal/hints.test.ts:15:18')
  })
})

describe('Test `checkXYParam` functions', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  test('should be defined', () => {
    expect(checkStringParam).toBeDefined()
    expect(checkPageParam).toBeDefined()
  })

  test('should do nothing if valid string is passed', () => {
    checkStringParam('testParam', 'validString')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  test('should warn about empty string', () => {
    checkStringParam('testParam', '')
    expect(warnSpy).toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('is missing or empty'))
    // with correct hint
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('_internal/hints.test.ts:43:5'))
  })

  test('should warn about invalid param type', () => {
    // @ts-expect-error intentional wrong type
    checkStringParam('testParam', 123)
    expect(warnSpy).toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('is not a string'))
    // with correct hint
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('_internal/hints.test.ts:52:5'))
  })

  test('should warn about empty NuxtPage', () => {
    checkPageParam('testParam', undefined)
    expect(warnSpy).toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('is missing or empty'))
    // with correct hint
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('_internal/hints.test.ts:60:5'))
  })

  test('should warn about invalid NuxtPage param 1', () => {
    // @ts-expect-error intentional wrong type
    checkPageParam('testParam', 123)
    expect(warnSpy).toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('is not a NuxtPage'))
    // with correct hint
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('_internal/hints.test.ts:69:5'))
  })

  test('should warn about invalid NuxtPage param 2', () => {
    // @ts-expect-error intentional wrong type
    checkPageParam('testParam', { a: 1 })
    expect(warnSpy).toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('is not a NuxtPage'))
    // with correct hint
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('_internal/hints.test.ts:78:5'))
  })
})
