export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],

  compatibilityDate: '2026-02-22',

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
