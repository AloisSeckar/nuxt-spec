# Nuxt Spec

![Nuxt Spec](https://github.com/AloisSeckar/nuxt-spec/blob/main/public/nuxt-spec.png)

**Nuxt Spec** (aka `nuxt-spec`) is a base layer for [Nuxt](https://nuxt.com/) applications incorporating together a couple of testing libraries and packages and providing some utility functions. I created this project in early 2025 because I was unable to find a convenient "one-dependency" way to start testing my Nuxt apps and I didn't want to repeat the same steps and maintain the same set of dependencies over and over. 

While Nuxt itself does have a [dedicated module for testing](https://nuxt.com/docs/getting-started/testing), to remain as versatile as possible, it has to be combined with other packages (which can be different based on your choice). I am trying to overcome this by defining "the way". This is both the strength and the weakness of this project. You were warned.

The most important client of `nuxt-spec` is my [Nuxt Ignis](https://github.com/AloisSeckar/nuxt-ignis) template starter that adds up even more ready-to-use cool stuff for your future awesome Nuxt websites.

## How to use

Aside from being "forked" and used as you seem fit, `nuxt-spec` is also available as an [NPM package](https://www.npmjs.com/package/nuxt-spec) that can be referenced as a single-import with all the features incoming.

The `nuxt-spec` package comes with a CLI tool that can help you:
- setup the dependency in your project
- scaffold the default `vitest.config.ts` (see [configuration](#configuration) section)
- add a few test-related script shorthands into your `package.json` (see [running tests](#running-tests) section)

To use it, just run the following command in your terminal:

```bash
npx nuxt-spec setup
```

First, the CLI tool will ask you whether you want to do the setup automatically. If you choose `y`es, it will perform all the steps for you. If you choose `n`o, it will guide you through the manual setup step-by-step (see [manual setup](#manual-setup) section).

### Manual setup

If you don't want to use the CLI tool, or you want to understand its flow better, here are the detailed steps:

1) Add following dependency into your `package.json`:
```
"nuxt-spec": "0.1.7"
```

2) Add following section into your `nuxt.config.ts`:
```
extends: [
  'nuxt-spec'
]
```

3) Add `.npmrc` file with following content (if you don't have it yet):
```
shamefully-hoist=true
strict-peer-dependencies=false
```

4) Add `vitest.config.ts` file with following content (if you don't have it yet):

```ts
import { loadVitestConfig } from 'nuxt-spec/config'

export default loadVitestConfig({
  // your custom config here
})
```

5) (Optional) Add following scripts into your `package.json`:
```
"scripts": {
  "test": "vitest run",
  "test-u": "vitest run -u",
  "test-i": "vitest"
}
```
### Install and execute

Whether you used the CLI tool or did the manual setup, you are ready to install and run the tests.

1) Run `pnpm install` to install the dependencies.

2) If you're prompoted (for the first time when installing to a new machine), run `pnpm exec playwright-core install` to download and locally install headless browser runtimes.

3) Run `pnpm dev` to start the development server of your awesome Nuxt project!

### Running tests

Once installed, Vitest automatically discovers all `*.test.ts` and `*.spec.ts` files in project and becomes capable of running them.

You can use those three optional commands `package.json` file in `"scripts"` section in order to run tests easilly:
- `test: vitest run` - runs once and ends
- `test-u: vitest run -u` - runs once and updates snapshots
- `test-i: vitest` - runs and waits in HMR mode for test file changes

Then you can call in terminal in root of your project: 

`pnpm test` | `pnpm test-u` | `pnpm test-i`

Or you can use the `vitest` command directly with all its parameters. See [Vitest CLI documentation](https://vitest.dev/guide/cli.html) for more info.

## Overview

**Nuxt Spec** currently contains:
- [vitest](https://www.npmjs.com/package/vitest) **v4** as the fundamental testing framework
- [@vitest/browser](https://www.npmjs.com/package/@vitest/browser) as the experimental browser runner
- [happy-dom](https://www.npmjs.com/package/happy-dom) as the headless browser runtime
- [playwright-core](https://www.npmjs.com/package/playwright-core) as the headless browser testing framework
- [@vue/test-utils](https://www.npmjs.com/package/@vue/test-utils) for testing Vue stuff
- [@nuxt/test-utils](https://www.npmjs.com/package/@nuxt/test-utils) for testing Nuxt stuff

Planned future development:
- reason about (not) using Vitest browser mode (or make it optional)
- solution for visual testing - either [backstopjs](https://www.npmjs.com/package/backstopjs) or Vitest's native (currently experimental)

See [CHANGELOG.md](https://github.com/AloisSeckar/nuxt-spec/blob/main/CHANGELOG.md) for the latest updates and features.

## Configuration

By default, `nuxt-spec` uses Vitest configuration defined in [`/config/index.mjs`](https://github.com/AloisSeckar/nuxt-spec/blob/main/config/index.mjs). The configuration is based on [Nuxt team recommendations](https://nuxt.com/docs/4.x/getting-started/testing) and our best judgement.

To add/override your custom config, you can create (or scaffold via CLI tool) a file named `vitest.config.ts` in the root of your project with the following content:

```ts
import { loadVitestConfig } from 'nuxt-spec/config'

export default loadVitestConfig({
  // your custom config here
})
```

And pass whatever you want as a parameter object. It will be defu-merged with the defaults (custom config takes precedence).

Alternatively, if you don't want to use any part of the `nuxt-spec` default configuration, you can override `vitest.config.ts` file completely and define your own [Vitest configuration](https://vitest.dev/config/) from scratch.

## Contact

Use GitHub issues to report bugs or suggest improvements. I will be more than happy to address them.
