import { execFileSync } from 'node:child_process'

// whitelisted characters for Windows command tokens
const SAFE_WIN_TOKEN = /^[\w@.\-:/=]+$/

/**
 * Runs a command synchronously without a shell string.
 *
 * Package managers are `.cmd` shims on Windows, which Node can only start through `cmd.exe`.
 * Every token must be free of `cmd.exe` metacharacters there (see "Known exceptions" in SECURITY.md).
 *
 * @param {string} cmd - Command with space-separated tokens (no quoting).
 * @param {object} [options] - Options passed to `execFileSync` (`stdio` defaults to `inherit`).
 * @throws {Error} On Windows, if any token contains unsafe characters.
 */
export function runCmd(cmd, { stdio = 'inherit', cwd, env } = {}) {
  const [file, ...args] = cmd.split(' ')
  if (process.platform === 'win32') {
    const unsafe = [file, ...args].find(token => !SAFE_WIN_TOKEN.test(token))
    if (unsafe !== undefined) {
      throw new Error(`Refusing to run command with unsafe argument '${unsafe}'`)
    }
    execFileSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', file, ...args], { stdio, cwd, env })
  } else {
    execFileSync(file, args, { stdio, cwd, env })
  }
}
