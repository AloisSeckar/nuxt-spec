# Nuxt Spec configuration

By default, `nuxt-spec` uses Vitest configuration defined in [`/config/index.mjs`](https://github.com/AloisSeckar/nuxt-spec/blob/v0.2.4/config/index.mjs). The configuration is based on [Nuxt team recommendations](https://nuxt.com/docs/4.x/getting-started/testing) and our best judgement.

To add/override your custom config, you can create (or scaffold via CLI tool) a file named `vitest.config.ts` in the root of your project with the following content:

```ts
import { loadVitestConfig } from 'nuxt-spec/config'

export default loadVitestConfig({
  // your custom config here
})
```

And pass whatever you want as a parameter object. It will be defu-merged with the defaults (custom config takes precedence). The object is typed to be compatible with both [Vite](https://vite.dev/config/) and [Vitest](https://vitest.dev/config/) configuration options. The type used is derived from the respective `.d.ts` files of those packages.

**NOTE**: Based on the [Vitest documentation](https://main.vitest.dev/config/), it is possible to pass in **any configuration option** valid for [Vite](https://vite.dev/config/). Configuration related directly to Vitest must be passed under the `test` key, e.g.:

```ts
import { loadVitestConfig } from 'nuxt-spec/config'

export default loadVitestConfig({
  test: {
    // your custom config specific to Vitest here
  },
  // by the nature of the Vitest config resolution,
  // you may also pass ANY OTHER valid Vite configuration options here
})
```

## Default projects

By default, Nuxt Spec built-in configuration establishes 4 `projects` + one fallback:

- `unit` - for unit tests in `test/unit/**` - env is set to `node`
- `nuxt` - for Nuxt-related tests in `test/nuxt/**` - env is set to `nuxt`
- `e2e` - for end-to-end tests in `test/e2e/**` - env is set to `node`
- `browser` - for browser-mode tests in `test/browser/**` - env is set to `node` (this is effectively an alternative to `nuxt` relying on `@vitest/browser` instead of `@nuxt/test-utils`)
- `default` - fallback for all other tests in `test/**` and/or `tests/**` directories - env is set to `node`

Vitest will then expect at least one test defined in either of those directories. Any part of the `test.projects` config may be altered, and user-defined values will be logically merged with the defaults. You may also add definitions for new custom projects to fit your needs. If your project uses a significantly different configuration (i.e. your tests reside in completely different paths), you can pass `false` as the second parameter to the `loadVitestConfig()` function to exclude the default `test.projects` values from being injected completely:

```ts
import { loadVitestConfig } from 'nuxt-spec/config'

export default loadVitestConfig({
  // your custom config here
}, false)
```

Alternatively, if you don't want to use any part of the `nuxt-spec` default configuration at all, you can override `vitest.config.ts` file completely and define your own [Vitest configuration](https://vitest.dev/config/) from scratch.

## Filtering out log messages

Some tedious and irrelevant log messages may keep appearing in running tests, creating noise and hiding the real issues.

Via the `NUXT_SPEC_MESSAGE_FILTERS` env variable, you can pass a comma-separated list of plain text patterns that should be omitted.

It only applies to logs processed by `vitest` though, so some messages might still prevail.