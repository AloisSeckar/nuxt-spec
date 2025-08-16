// custom Vitest configuration wrapper that allows custom user config
// to be merged with defaults provided by nuxt-spec package

// this is the variant required to run tests locally during development
// refer to /config/vitest.config.ts.template for the client variant

import { loadVitestConfig } from './app/utils/vitest-config'

export default loadVitestConfig({
  // custom config here
})
