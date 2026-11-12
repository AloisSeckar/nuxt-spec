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

  compatibilityDate: '2026-10-13',

  // temp fix until https://github.com/nuxt/hints/issues/399 is resolved
  // do no print out warning beyond our reach (NDT_DEP_0003 inside @nuxt/hints module)
  hooks: {
    'modules:before': () => {
      const warn = console.warn
      console.warn = (...args: unknown[]) => {
        console.log(...args)
        if (typeof args[0] === 'string' && args[0].includes('NDT_DEP_0003')) return
        warn(...args)
      }
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
