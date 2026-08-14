// @nuxt/hints module is included by default
// set NUXT_SPEC_HINTS_ENABLED=false to exclude it
const hintsEnabled = process.env.NUXT_SPEC_HINTS_ENABLED !== 'false'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
    ...(hintsEnabled ? ['@nuxt/hints'] : []),
  ],

  // exclude file used for explicit exports (nuxt-spec/components) from Nuxt resolution
  components: {
    dirs: [{ path: '~/components', ignore: ['index.ts'] }],
  },

  compatibilityDate: '2026-08-08',

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
