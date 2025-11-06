export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],

  compatibilityDate: '2025-11-04',

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
