import { execFileSync } from 'node:child_process'

export const FALLBACK_DEFAULT_BRANCH = 'main'

// run a read-only git command, returning trimmed stdout or `undefined` on failure
function git(...args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || undefined
  } catch {
    return undefined
  }
}

function hasRef(ref) {
  try {
    execFileSync('git', ['show-ref', '--verify', '--quiet', ref], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

export function isGitRepo() {
  return git('rev-parse', '--is-inside-work-tree') === 'true'
}

/**
 * Resolve the default branch of the Git repository in the current working directory.
 *
 * Tries (in order):
 *  1) HEAD of `origin` remote (or the first available remote) - set when cloned or via `git remote set-head <remote> --auto`
 *  2) existing local or remote-tracking `main` or `master` branch
 *  3) the only local branch, or current branch if there are no commits yet
 *  4) `init.defaultBranch` from Git config
 *
 * @returns {{ branch: string, source: string }} resolved branch name and description of where it came from
 */
export function resolveDefaultBranch() {
  if (isGitRepo()) {
    const remotes = git('remote')?.split(/\r?\n/) ?? []
    const remote = remotes.includes('origin') ? 'origin' : remotes[0]
    if (remote) {
      const remoteHead = git('symbolic-ref', '--quiet', '--short', `refs/remotes/${remote}/HEAD`)
      if (remoteHead?.startsWith(`${remote}/`)) {
        return { branch: remoteHead.slice(remote.length + 1), source: `HEAD of '${remote}' remote` }
      }
    }

    for (const candidate of ['main', 'master']) {
      if (hasRef(`refs/heads/${candidate}`) || (remote && hasRef(`refs/remotes/${remote}/${candidate}`))) {
        return { branch: candidate, source: 'existing branch' }
      }
    }

    const localBranches = git('for-each-ref', '--format=%(refname:short)', 'refs/heads')?.split(/\r?\n/) ?? []
    if (localBranches.length === 1) {
      return { branch: localBranches[0], source: 'the only local branch' }
    }
    if (localBranches.length === 0) {
      const unbornHead = git('symbolic-ref', '--quiet', '--short', 'HEAD')
      if (unbornHead) {
        return { branch: unbornHead, source: 'current branch of repository without commits' }
      }
    }
  }

  const configured = git('config', '--get', 'init.defaultBranch')
  if (configured) {
    return { branch: configured, source: 'Git config \'init.defaultBranch\'' }
  }

  return { branch: FALLBACK_DEFAULT_BRANCH, source: 'fallback value' }
}
