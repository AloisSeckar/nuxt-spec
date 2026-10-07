export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
    // @nuxt/hints module is handled in `modules/spec-options.ts`
  ],

  // exclude file used for explicit exports (nuxt-spec/components) from Nuxt resolution
  components: {
    dirs: [{ path: '~/components', ignore: ['index.ts'] }],
  },

  compatibilityDate: '2026-10-07',

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
