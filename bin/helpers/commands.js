import { getPackageManager } from 'elrh-cosca'

export const SUPPORTED_PACKAGE_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun', 'deno']

// get the package manager name for usage in commands
// explicit override takes precedence over auto-detection
export function resolvePackageManager(override) {
  if (override) {
    if (!SUPPORTED_PACKAGE_MANAGERS.includes(override)) {
      throw new Error(`Unsupported package manager '${override}'. Use one of: ${SUPPORTED_PACKAGE_MANAGERS.join(', ')}`)
    }
    return override
  }
  return getPackageManager()
}

// use nuxt-spec CLI tool
export function getCmd(packageManager) {
  const command = 'nuxt-spec'
  switch (packageManager) {
    case 'pnpm':
      return `pnpx ${command}`
    case 'yarn':
      return `yarn dlx ${command}`
    case 'bun':
      return `bunx ${command}`
    case 'deno':
      return `deno run -A npm:${command}`
    default:
      return `npx ${command}`
  }
}

// update nuxt-spec
export function getUpdateCmd(packageManager, target) {
  switch (packageManager) {
    case 'pnpm':
      return `pnpm update ${target}`
    case 'yarn':
      return `yarn up ${target}`
    case 'bun':
      return `bun update ${target}`
    case 'deno':
      return `deno add npm:${target}`
    default:
      return `npm install ${target}`
  }
}

// generate Nuxt types and auto-imports
export function getPrepareCmd(packageManager) {
  const command = 'nuxt prepare'
  switch (packageManager) {
    case 'pnpm':
      return `pnpm exec ${command}`
    case 'yarn':
      return `yarn ${command}`
    case 'bun':
      return `bunx ${command}`
    case 'deno':
      return `deno run -A npm:${command}`
    default:
      return `npx ${command}`
  }
}

// install/update playwright
export function getPlaywrightInstallCmd(packageManager) {
  const command = 'playwright install'
  switch (packageManager) {
    case 'pnpm':
      return `pnpm exec ${command}`
    case 'yarn':
      return `yarn ${command}`
    case 'bun':
      return `bunx ${command}`
    case 'deno':
      return `deno run -A npm:${command}`
    default:
      return `npx ${command}`
  }
}
