export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],

  compatibilityDate: '2025-11-04',

  // workaround for https://github.com/nuxt/nuxt/issues/33593
  typescript: {
    tsConfig: {
      include: [
        '../tests/**/*.ts',
        '../tests/**/*.spec.ts',
        '../tests/**/*.test.ts',
        '../test/**/*.ts',
        '../test/**/*.spec.ts',
        '../test/**/*.test.ts',
      ],
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
