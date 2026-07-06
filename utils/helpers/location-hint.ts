import { createRequire } from 'node:module'
import { dirname } from 'node:path'

// shows "(at path-to-file:line:column)" hint to locate cause from stack trace
// this syntax allow tools like VS Code to create clickable link directly to the source
export function locationHint(): string {
  return `  (at ${getCallSite()})`
}

// path to nuxt-spec/utils directory computed on runtime
const pkgUtilsDir = normalizePath(dirname(createRequire(import.meta.url).resolve('nuxt-spec/utils')))

// handle possible Win backslashes
function normalizePath(path: string): string {
  return path.replace(/^file:\/\//, '').replace(/\\/g, '/')
}

// locate first stack frame outside of nuxt-spec utils
// which will the place where the utility function is being called from
function getCallSite(): string | undefined {
  const stack = new Error().stack?.split('\n').slice(1) ?? []
  for (const raw of stack) {
    const match = raw.match(/\(?((?:file:\/\/)?[^()\s]+:\d+:\d+)\)?\s*$/)
    if (!match?.[1]) continue
    const location = normalizePath(match[1])
    if (location.includes(pkgUtilsDir)) continue
    return location
  }
  return undefined
}
