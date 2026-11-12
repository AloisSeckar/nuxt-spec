#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import {
  createFileFromWebTemplate, pathExists, promptUser, showMessage, updateYamlFile,
} from 'elrh-cosca'
import { isGitRepo, resolveDefaultBranch } from '../helpers/git.js'
import { SPEC_URL, PLAYWRIGHT_VERSION } from '../helpers/constants.js'

const SUPPORTED_CI_HOSTS = ['github', 'gitlab']

const GITLAB_ROOT_FILE = '.gitlab-ci.yml'

export const CI_TEMPLATES = {
  github: [
    { template: '.github/workflows/ci-test-verify.yml.template', targetPath: '.github/workflows/ci-test-verify.yml' },
    { template: '.github/workflows/ci-test-update.yml.template', targetPath: '.github/workflows/ci-test-update.yml' },
  ],
  gitlab: [
    { template: '.gitlab/ci/ci-test-verify.yml.template', targetPath: '.gitlab/ci/ci-test-verify.yml' },
    { template: '.gitlab/ci/ci-test-update.yml.template', targetPath: '.gitlab/ci/ci-test-update.yml' },
  ],
}

function getDefaultBranch() {
  if (!isGitRepo()) {
    console.warn('[Nuxt Spec] Current folder is not a Git repository.')
  }
  const { branch, source } = resolveDefaultBranch()
  // value is inserted into YAML unquoted
  if (!/^[\w./+-]+$/.test(branch)) {
    throw new Error(`Default branch name '${branch}' (resolved from ${source}) contains unsupported characters.`)
  }
  showMessage({ message: `[Nuxt Spec] Using '${branch}' as the default branch (resolved from ${source}).` })
  return branch
}

/**
 * CLI tool to scaffold CI test workflows for selected Git host.
 *
 * It first asks whether to run in "auto" mode (no prompts, force = true) or "manual" mode (with prompts, force = false).
 *
 * Then it:
 *  1) creates CI workflow files for the selected host
 *  2) fills in placeholders - Playwright version and default branch of the Git repository in the current folder (resolved only if used)
 *  3) (GitLab only) adds CI files into `include` section of `.gitlab-ci.yml` (scaffolded from template if missing)
 *
 * @param {string} host - Target Git host (`github` or `gitlab`).
 * @param {boolean} autoRun - Whether to run the scaffolding automatically without any prompts (defaults to false).
 */
export async function specCi(host, autoRun = false) {
  showMessage({ message: 'NUXT SPEC CI' })
  showMessage({ message: `This CLI tool will help you scaffold CI test workflows for '${host}'.` })
  showMessage({ message: 'Refer to the documentation for more information.', linesAfter: 2 })

  if (!SUPPORTED_CI_HOSTS.includes(host)) {
    throw new Error(`${host ? `Unsupported CI host '${host}'` : 'Missing CI host'}. Use one of: ${SUPPORTED_CI_HOSTS.join(', ')}`)
  }

  const templates = CI_TEMPLATES[host]

  const isAutoRun = autoRun || await promptUser({ question: '[Nuxt Spec] Do you want to scaffold everything automatically (no more prompts)?' })
  showMessage({ message: '' })

  let branch
  const created = []
  for (const { template, targetPath } of templates) {
    // 1) create workflow files
    const exists = pathExists({ targetPath: targetPath })
    const proceed = isAutoRun || await promptUser({
      question: exists
        ? `[Nuxt Spec] File '${targetPath}' already exists. Overwrite?`
        : `[Nuxt Spec] This will create '${targetPath}' file. Continue?`,
    })
    if (!proceed) {
      if (!exists) {
        throw new Error(`Creation of '${targetPath}' declined - CI setup cannot be completed without it.`)
      }
      console.log(`[Nuxt Spec] Existing '${targetPath}' kept.`)
      continue
    }
    await createFileFromWebTemplate({ url: `${SPEC_URL}/config/templates/${template}`, targetPath, force: true })

    // 2) fill in placeholders
    let content = readFileSync(targetPath, 'utf8').replaceAll('__PLAYWRIGHT_VERSION__', PLAYWRIGHT_VERSION)
    if (content.includes('__DEFAULT_BRANCH__')) {
      branch ??= getDefaultBranch()
      content = content.replaceAll('__DEFAULT_BRANCH__', branch)
    }
    writeFileSync(targetPath, content)
    created.push(targetPath)
  }

  // 3) (GitLab only) register CI files in root pipeline
  if (host === 'gitlab') {
    if (pathExists({ targetPath: GITLAB_ROOT_FILE })) {
      await updateYamlFile({
        targetPath: GITLAB_ROOT_FILE,
        yamlKey: 'include',
        patch: templates.map(({ targetPath }) => ({ local: targetPath })),
        force: isAutoRun,
        prompt: `[Nuxt Spec] This will add CI files into 'include' section of your '${GITLAB_ROOT_FILE}'. Continue?`,
      })
    } else {
      await createFileFromWebTemplate({
        url: `${SPEC_URL}/config/templates/${GITLAB_ROOT_FILE}.template`,
        targetPath: GITLAB_ROOT_FILE,
        force: isAutoRun,
        prompt: `[Nuxt Spec] This will create '${GITLAB_ROOT_FILE}' file including the CI files. Continue?`,
      })
    }
  }

  // 4) inform user
  showMessage({ message: '' })
  showMessage({ message: 'NUXT SPEC CI COMPLETE', linesAfter: 2 })
  if (created.length > 0) {
    showMessage({ message: 'Review the created files and complete the prerequisites described in their headers.' })
  }
  if (branch) {
    showMessage({ message: `Verify '${branch}' is the correct default branch.` })
    showMessage({ message: `If not, run \`git remote set-head origin --auto\` and re-run this command, or adjust the files manually.` })
  }
}
