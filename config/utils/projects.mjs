/**
 * Check presence of `extends: true` settings for Vitest projects
 * @param projects - Array of Vitest project configurations to check
 */
export function warnNotExtendingProjects(projects) {
  if (!Array.isArray(projects)) return
  const names = projects
    .filter(p => typeof p === 'object' && p !== null && typeof p.then !== 'function' && p.extends !== true)
    .map((p) => {
      const name = p.test?.name ?? p.name
      return (typeof name === 'object' ? name?.label : name) ?? '(unnamed)'
    })
  if (names.length > 0) {
    console.warn(`[Nuxt Spec] Vitest projects should extend the base config (\`extends: true\`): ${names.join(', ')}. `
      + 'If this is intentional, set `spec.ignoreBaseConfig: true` to suppress this warning.')
  }
}
