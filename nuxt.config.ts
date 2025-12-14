export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],

  compatibilityDate: '2025-12-14',

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
