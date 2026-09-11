import { getPackageManager } from 'elrh-cosca'

// use nuxt-spec CLI tool
export function getCmd() {
  const command = 'nuxt-spec'
  const packageManager = getPackageManager()
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
