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
vi.mock('node:child_process', () => ({ execFileSync: vi.fn() }))

function mockExistingFiles(files: string[]) {
  vi.mocked(pathExists).mockImplementation(({ targetPath }) => files.includes(targetPath))
}

function shownMessages() {
  return vi.mocked(showMessage).mock.calls.map(([opts]) => typeof opts === 'string' ? opts : opts.message)
}

describe('Test `specSetup` handling of Nuxt config file', () => {
  beforeEach(() => {
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  test('should alter `nuxt.config.cjs` without asking for manual edit', async () => {
    mockExistingFiles(['package.json', 'nuxt.config.cjs'])

    await specSetup(false, 'pnpm')

    expect(updateConfigFile).toHaveBeenCalledOnce()
    expect(updateConfigFile).toHaveBeenCalledWith(expect.objectContaining({ targetPath: 'nuxt.config.cjs' }))
    expect(createFileFromWebTemplate).not.toHaveBeenCalledWith(
      expect.objectContaining({ targetPath: expect.stringContaining('nuxt.config') }),
    )
    expect(shownMessages().some(m => m.includes('manually'))).toBe(false)
  })

  test('should alter `nuxt.config.mjs` without asking for manual edit', async () => {
    mockExistingFiles(['package.json', 'nuxt.config.mjs'])

    await specSetup(false, 'pnpm')

    expect(updateConfigFile).toHaveBeenCalledOnce()
    expect(updateConfigFile).toHaveBeenCalledWith(expect.objectContaining({ targetPath: 'nuxt.config.mjs' }))
    expect(shownMessages().some(m => m.includes('manually'))).toBe(false)
  })
})
