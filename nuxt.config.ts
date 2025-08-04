export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],

  compatibilityDate: '2025-08-04',

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
