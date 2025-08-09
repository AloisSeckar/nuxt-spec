import { existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { promptUser } from './prompt-user.js'

export async function updatePackageJsonScripts(scriptsToAdd) {
  const shouldUpdate = await promptUser(
    `This will update scripts section of 'package.json' file. Continue?`,
  )
  if (shouldUpdate) {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json')

    if (!existsSync(packageJsonPath)) {
      console.warn(`No 'package.json' found in project root — skipping script updates.`)
      return
    }

    const pkgRaw = readFileSync(packageJsonPath, 'utf8')
    let pkg
    try {
      pkg = JSON.parse(pkgRaw)
    } catch {
      console.error(`Could not parse 'package.json' — skipping script updates.`)
      return
    }

    pkg.scripts = pkg.scripts || {}

    let modified = false

    for (const [name, cmd] of Object.entries(scriptsToAdd)) {
      if (pkg.scripts[name] !== cmd) {
        pkg.scripts[name] = cmd
        modified = true
      }
    }

    if (modified) {
      writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
      console.log(`Scripts section of 'package.json' updated.`)
    } else {
      console.log(`Scripts section of 'package.json' already up to date.`)
    }
  } else {
    console.log(`Adding scripts to 'package.json' skipped.`)
  }
}
