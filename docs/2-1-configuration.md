# Nuxt Spec configuration

## Vitest setup

By default, `nuxt-spec` uses Vitest configuration defined in [`/config/index.mjs`](https://github.com/AloisSeckar/nuxt-spec/blob/v0.4.0-alpha.1/config/index.mjs). The configuration is based on [Nuxt team recommendations](https://nuxt.com/docs/4.x/getting-started/testing) and our best judgement.

To add/override your custom config, you can create (or scaffold via CLI tool) a file named `vitest.config.ts` in the root of your project with the following content:

```ts [vitest.config.ts]
import { loadVitestConfig } from 'nuxt-spec/config'

export default loadVitestConfig({
  // your custom config here
})
```

And pass whatever you want as a parameter object. It will be defu-merged with the defaults (custom config takes precedence). The object is typed to be compatible with both [Vite](https://vite.dev/config/) and [Vitest](https://vitest.dev/config/) configuration options. The type used is derived from the respective `.d.ts` files of those packages.

**NOTE**: Based on the [Vitest documentation](https://main.vitest.dev/config/), it is possible to pass in **any configuration option** valid for [Vite](https://vite.dev/config/). Configuration related directly to Vitest must be passed under the `test` key, e.g.:

```ts [vitest.config.ts]
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

Vitest will then expect at least one test defined in any of those directories. Any part of the `test.projects` config may be altered, and user-defined values will be logically merged with the defaults. You may also add definitions for new custom projects to fit your needs.

### Configuring projects

If your project uses a significantly different configuration (e.g. your tests reside in completely different paths), you can pass `false` as the second parameter to the `loadVitestConfig()` function to exclude the default `test.projects` values from being injected completely:

```ts [vitest.config.ts]
import { loadVitestConfig } from 'nuxt-spec/config'

export default loadVitestConfig({
  // your custom config here
}, false)
```

For fine-grained control over included projects, you can also use a [config object](https://github.com/AloisSeckar/nuxt-spec/blob/v0.4.0-alpha.1/config/index.d.ts#L16). When a config object is used, only projects with explicitly passed `true` value will be included. For example, using this setting, only `unit` and `nuxt` will be activated:

```ts [vitest.config.ts]
import { loadVitestConfig } from 'nuxt-spec/config'

export default loadVitestConfig({
  // your custom config here
}, { unit: true, nuxt: true })
```

## Code coverage

Both [Vitest coverage providers](https://vitest.dev/guide/coverage.html) - `@vitest/coverage-v8` and `@vitest/coverage-istanbul` - are included in Nuxt Spec dependencies, so nothing needs to be installed.

To start collecting test coverage, pass the Vitest [coverage config](https://vitest.dev/config/coverage.html) via `test.coverage` into `loadVitestConfig()`:

```ts [vitest.config.ts]
import { loadVitestConfig } from 'nuxt-spec/config'

export default loadVitestConfig({
  test: {
    coverage: {
      enabled: true,
      // 'v8' (Vitest default) or 'istanbul'
      provider: 'v8',
    },
  },
})
```

By default, the report is written into the `coverage` folder, which is added to your `.gitignore` by the CLI [setup](1-2-installation.html).

## Opting-out from defaults

If you don't want to use any part of the `nuxt-spec` default configuration at all, you can override the `vitest.config.ts` file completely and define your own [Vitest configuration](https://vitest.dev/config/) from scratch.

## Nuxt Spec options

Behavior of Nuxt Spec itself can be adjusted via the `spec` key in your `nuxt.config.ts`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  extends: ['nuxt-spec'],
  spec: {
    // include @nuxt/hints module (default: true)
    hints: true,
    // WebSocket endpoint of an external Playwright server (default: not set => not used)
    externalPlaywright: 'ws://localhost:3000/',
    htmlReport: {
      // generate HTML test report (default: true)
      enabled: true,
      // when to open the report file in browser - 'always' | 'failed' | 'never' (default: 'failed')
      open: 'failed',
    },
    // additional log messages to omit (default: [])
    messageFilters: ['some tedious message'],
  },
})
```

Each option can also be set via an env variable:

| `spec` option | env variable |
| --- | --- |
| `hints` | `NUXT_SPEC_HINTS_ENABLED` |
| `externalPlaywright` | `NUXT_SPEC_EXTERNAL_PLAYWRIGHT` |
| `htmlReport.enabled` | `NUXT_SPEC_HTML_REPORT` |
| `htmlReport.open` | `NUXT_SPEC_HTML_REPORT_OPEN` |
| `messageFilters` | `NUXT_SPEC_MESSAGE_FILTERS` (comma-separated) |

If both are set, the env variable takes precedence. The only exception is `messageFilters`, where values from both sources are combined. Boolean env variables only disable the feature with an explicit `false` value. Env variables can also be defined in the `.env` file in the root of your project.

Values of unexpected type (or unsupported `htmlReport.open` values) are reported with a console warning and replaced by the default value.

The `spec` key is typed automatically once Nuxt types are generated (e.g. via `nuxt prepare`).

The values are read from `nuxt.config.ts` located in the current working directory when the Vitest config is loaded. When you change them, restart Vitest to apply the changes (this also applies to watch mode).

### External Playwright server

By default, a local Playwright instance is built when executing `e2e` and `browser` tests.

By setting `spec.externalPlaywright` (or the `NUXT_SPEC_EXTERNAL_PLAYWRIGHT` env variable) to an external WebSocket URL, you can reference an existing Playwright server instead. Nuxt Spec will automatically wire it up. The connection will be established with the `exposeNetwork: '<loopback>'` setting by default. See [Vitest docs](https://vitest.dev/config/browser/playwright.html#connectoptions) for details.

**NOTE that the remote Playwright version must match `~1.63.0` to align with the version used by Nuxt Spec.** Connection attempts to an older version will be rejected by Playwright's built-in guard.

### HTML test report

After each test run, Nuxt Spec generates a self-contained HTML report file in `test/__reports__/report-YYYYMMDDHHMMSS.html` (relative to the Vitest root). It covers all test projects. Old report files are kept, so you should add the folder to your `.gitignore`:

```sh [.gitignore]
__reports__
```

The report always contains a summary line (e.g. `5/5 tests passed`). Details are only rendered for failed tests (error message, diff, stack trace, and for failed [`compareScreenshot`](./2-2-utilities.md#comparescreenshot) calls also the baseline and the actual screenshot), as well as for errors that happened outside of tests (failed test modules, failed `beforeAll`/`afterAll` hooks and unhandled errors).

The report is produced by a custom Vitest reporter. It is registered via a Vite plugin that appends it to whatever reporters are in effect, so it works together with the default Vitest reporters, with `reporters` set in your config, as well as with the `--reporter` CLI option.

To disable the report completely, set `spec.htmlReport.enabled` to `false`:

```ts [nuxt.config.ts]
spec: {
  htmlReport: { enabled: false },
}
```

or set the `NUXT_SPEC_HTML_REPORT` env variable to `false`:

```sh [.env]
NUXT_SPEC_HTML_REPORT=false
```

By default, the report is automatically opened in the system default browser when at least one test fails. This can be changed via `spec.htmlReport.open` (or the `NUXT_SPEC_HTML_REPORT_OPEN` env variable):

- `failed` - (default) open only if the test run failed
- `always` - open after each test run
- `never` - never open, only print the path into the console

```ts [nuxt.config.ts]
spec: {
  htmlReport: { open: 'always' },
}
```

```sh [.env]
NUXT_SPEC_HTML_REPORT_OPEN=always
```

Regardless of this setting, the report is never opened when Node operates in `CI` mode or when Vitest runs in watch mode (a fresh report is still generated after each re-run).

### Filtering out log messages

Some tedious and irrelevant log messages may keep appearing in running tests, creating noise and hiding the real issues.

Via `spec.messageFilters` (an array) or the `NUXT_SPEC_MESSAGE_FILTERS` env variable (a comma-separated list), you can pass plain text patterns that should be omitted. Patterns from both sources are combined.

It only applies to logs processed by `vitest` though, so some messages might still prevail.

### Nuxt Hints integration

By default, Nuxt Spec includes [@nuxt/hints](https://nuxt.com/modules/hints), a module that enhances DevTools with warnings about performance, hydration mismatches, third-party scripts, and other best practices.

If you don't want to use it, set `spec.hints` to `false`:

```ts [nuxt.config.ts]
spec: {
  hints: false,
}
```

or set the `NUXT_SPEC_HINTS_ENABLED` env variable to `false`:

```sh [.env]
NUXT_SPEC_HINTS_ENABLED=false
```

The module is served with its default configuration. See the [module documentation](https://nuxt.com/modules/hints#module-options) for additional config options of the module itself.
