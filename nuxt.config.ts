export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],

  compatibilityDate: '2025-08-08',

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
