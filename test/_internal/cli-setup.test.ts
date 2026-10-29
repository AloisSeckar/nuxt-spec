// unit tests for
// - cli/commands/setup.js

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createFileFromWebTemplate, pathExists, showMessage, updateConfigFile } from 'elrh-cosca'
import { specSetup } from '../../cli/commands/setup.js'

// all file operations and prompts are mocked, so setup has no side effects
vi.mock('elrh-cosca', async importOriginal => ({
  ...await importOriginal<typeof import('elrh-cosca')>(),
  createFileFromWebTemplate: vi.fn(),
  deletePath: vi.fn(),
  pathExists: vi.fn(),
  promptUser: vi.fn(async () => false),
  removeFromJsonFile: vi.fn(),
  showMessage: vi.fn(),
  updateConfigFile: vi.fn(),
  updateJsonFile: vi.fn(),
  updateTextFile: vi.fn(),
}))
vi.mock('node:child_process', () => ({ execSync: vi.fn() }))

function mockExistingFiles(files: string[]) {
  vi.mocked(pathExists).mockImplementation(({ targetPath }) => files.includes(targetPath))
}

function shownMessages() {
  return vi.mocked(showMessage).mock.calls.map(([{ message }]) => message)
}

describe('Test `specSetup` handling of Nuxt config file', () => {
  beforeEach(() => {
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  test('should skip `nuxt.config.cjs` and ask for manual edit at the end', async () => {
    mockExistingFiles(['package.json', 'nuxt.config.cjs'])

    await specSetup(false, 'pnpm')

    expect(updateConfigFile).not.toHaveBeenCalled()
    expect(createFileFromWebTemplate).not.toHaveBeenCalledWith(
      expect.objectContaining({ targetFile: expect.stringContaining('nuxt.config') }),
    )

    const messages = shownMessages()
    const completeIndex = messages.indexOf('NUXT SPEC SETUP COMPLETE')
    const warningIndex = messages.findIndex(m => m.includes('nuxt.config.cjs') && m.includes('manually'))
    expect(completeIndex).toBeGreaterThan(-1)
    expect(warningIndex).toBeGreaterThan(completeIndex)
  })

  test('should alter `nuxt.config.mjs` without asking for manual edit', async () => {
    mockExistingFiles(['package.json', 'nuxt.config.mjs'])

    await specSetup(false, 'pnpm')

    expect(updateConfigFile).toHaveBeenCalledOnce()
    expect(updateConfigFile).toHaveBeenCalledWith(expect.objectContaining({ targetFile: 'nuxt.config.mjs' }))
    expect(shownMessages().some(m => m.includes('manually'))).toBe(false)
  })
})
