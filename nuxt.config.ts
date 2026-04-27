export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],

  // exclude file used for explicit exports (nuxt-spec/components) from Nuxt resolution
  components: {
    dirs: [{ path: '~/components', ignore: ['index.ts'] }],
  },

  compatibilityDate: '2026-05-01',

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
