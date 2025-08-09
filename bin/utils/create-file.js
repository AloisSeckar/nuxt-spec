import path from 'path'
import { existsSync, copyFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { promptUser } from './prompt-user.js'

export async function createFileFromTemplate(templateFile, targetFile) {
  const shouldCreate = await promptUser(
    `This will create default 'vitest.config.ts' file. Continue?`,
  )
  if (shouldCreate) {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    const templatePath = path.resolve(__dirname, `../${templateFile}`)
    const targetPath = path.resolve(process.cwd(), targetFile)

    if (!existsSync(templatePath)) {
      console.error(`Template file not found at ${templatePath}`)
      process.exit(1)
    }

    if (existsSync(targetPath)) {
      const shouldOverwrite = await promptUser(
        `File 'vitest.config.ts' already exists. Overwrite?`,
      )
      if (!shouldOverwrite) {
        console.log('Aborted.')
        process.exit(0)
      }
    }

    copyFileSync(templatePath, targetPath)
    console.log(`Default 'vitest.config.ts' successfully created.`)
  } else {
    console.log(`Creation of 'vitest.config.ts' skipped.`)
  }
}
