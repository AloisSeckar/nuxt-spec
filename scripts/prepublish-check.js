#!/usr/bin/env node

// `prepublishOnly` guard for both `nuxt-spec` and `nuxt-spec-cli` - set by `release.js`
if (process.env.NUXT_SPEC_RELEASE !== 'true') {
  console.error('Publish aborted. Use `pnpm release` to publish `nuxt-spec` and `nuxt-spec-cli` together.')
  process.exit(1)
}
