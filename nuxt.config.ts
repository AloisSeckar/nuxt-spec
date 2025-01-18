export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],

  compatibilityDate: '2025-01-18',

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
