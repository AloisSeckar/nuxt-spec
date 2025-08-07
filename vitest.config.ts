// custom Vitest configuration wrapper that allows custom user config
// to be merged with defaults provided by nuxt-spec package

import { loadVitestConfig } from './utils/vitest-config'

export default loadVitestConfig({
  // custom config here
})
