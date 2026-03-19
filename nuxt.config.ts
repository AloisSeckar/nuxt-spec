export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],

  compatibilityDate: '2026-03-15',

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
