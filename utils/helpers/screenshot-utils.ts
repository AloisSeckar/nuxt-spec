import { resolve, sep } from 'node:path'
import type { DecodedPng } from 'fast-png'

// helper to keep user-provided targetDir inside the current project root
export function resolveWithin(base: string, segment: string): string {
  const target = resolve(base, segment)
  if (target !== base && !target.startsWith(base + sep)) {
    throw new Error(`[Nuxt Spec] Invalid path: "${segment}" resolves outside of "${base}"`)
  }
  return target
}

// helper for bridging difference between Vitest PNG saving and fast-png encoding
export function toRGBA(img: DecodedPng): Uint8Array {
  const { width, height, data, channels = 4 } = img
  if (channels === 4) return data as Uint8Array
  const pixels = width * height
  const rgba = new Uint8Array(pixels * 4)
  for (let i = 0; i < pixels; i++) {
    const src = i * 3
    rgba[i * 4 + 0] = data[src + 0] ?? 0
    rgba[i * 4 + 1] = data[src + 1] ?? 0
    rgba[i * 4 + 2] = data[src + 2] ?? 0
    rgba[i * 4 + 3] = 255
  }
  return rgba
}
