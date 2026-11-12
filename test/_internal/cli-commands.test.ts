// unit tests for
// - cli/helpers/commands.js

import { execFileSync } from 'node:child_process'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { runCmd } from '../../cli/helpers/commands.js'

vi.mock('node:child_process', () => ({ execFileSync: vi.fn() }))

describe('Test `runCmd`', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  test('should run the command as an argument array without a shell on POSIX', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('linux')

    runCmd('pnpm exec nuxt prepare')

    expect(execFileSync).toHaveBeenCalledWith('pnpm', ['exec', 'nuxt', 'prepare'], { stdio: 'inherit' })
  })

  test('should run the command through `cmd.exe` on Windows', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('win32')
    vi.stubEnv('ComSpec', 'C:\\Windows\\System32\\cmd.exe')

    runCmd('npm install nuxt-spec@1.0.0-alpha.1', 'ignore')

    expect(execFileSync).toHaveBeenCalledWith(
      'C:\\Windows\\System32\\cmd.exe',
      ['/d', '/s', '/c', 'npm', 'install', 'nuxt-spec@1.0.0-alpha.1'],
      { stdio: 'ignore' },
    )
  })

  test.each(['&', '|', '^', '%PATH%', '$(x)', '"x"', '`x`', 'a>b'])('should refuse the argument `%s` on Windows', (token) => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('win32')

    expect(() => runCmd(`pnpm install ${token}`)).toThrow('unsafe argument')
    expect(execFileSync).not.toHaveBeenCalled()
  })
})
