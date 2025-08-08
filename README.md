# Nuxt Spec

![Nuxt Spec](https://github.com/AloisSeckar/nuxt-spec/blob/main/public/nuxt-spec.png)

**Nuxt Spec** (aka `nuxt-spec`) is a base layer for [Nuxt](https://nuxt.com/) applications incorporating together a couple of testing libraries and packages and providing some utility functions. I created this project in early 2025 because I was unable to find a convenient "one-dependency" way to start testing my Nuxt apps and I didn't want to repeat the same steps and maintain the same set of dependencies over and over. 

While Nuxt itself does have a [dedicated module for testing](https://nuxt.com/docs/getting-started/testing), to remain as versatile as possible, it has to be combined with other packages (which can be different based on your choice). I am trying to overcome this by defining "the way". This is both the strength and the weakness of this project. You were warned.

The most important client of `nuxt-spec` is my [Nuxt Ignis](https://github.com/AloisSeckar/nuxt-ignis) template starter that adds up even more ready-to-use cool stuff for your future awesome Nuxt websites.


## How to use

Aside from being "forked" and used as you seem fit, `nuxt-spec` is also available as an [NPM package](https://www.npmjs.com/package/nuxt-spec) that can be referenced as a single-import with all the features incoming.

1) Add following dependency into your `package.json`:
```
"nuxt-spec": "0.1.0"
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

4) If you're prompoted, run `npm exec playwright-core install` to download and locally install headless browser runtimes.

**DONE.** You are just `npm install` and `npm run dev` away from testing your Nuxt projects!

### Running tests

Vitest automatically discovers all `*.test.ts` and `*.spec.ts` files in project and will run them.

It is recommended to add following two (p)npm commands into your `package.json` into `"scripts"` section in order to run tests easilly:
- `test: vitest run` - runs once and ends
- `test-i: vitest` - runs and waits in HMR mode for test file changes

Then you can call in terminal in root of your project: 

`npm run test` | `npm run test-i` or `pnpm test` | `pnpm test-i`

## Overview

**Nuxt Spec** currently contains:
- [vitest](https://www.npmjs.com/package/vitest) **v4** as the fundamental testing framework
- [@vitest/browser](https://www.npmjs.com/package/@vitest/browser) as the experimental browser runner
- [happy-dom](https://www.npmjs.com/package/happy-dom) as the headless browser runtime
- [playwright-core](https://www.npmjs.com/package/vitest) as the headless browser testing framework
- [@vue/test-utils](https://www.npmjs.com/package/@vue/test-utils) for testing Vue stuff
- [@nuxt/test-utils](https://www.npmjs.com/package/@nuxt/test-utils) for testing Nuxt stuff

Planned future development:
- reason about (not) using Vitest browser mode (or make it optional)
- solution for visual testing - either [backstopjs](https://www.npmjs.com/package/backstopjs) or Vitest's native (currently experimental)

## Configuration

By default, `nuxt-spec` uses Vitest configuration defined in [`/utils/vitest-config.ts`](https://github.com/AloisSeckar/nuxt-spec/blob/main/utils/vitest-config.ts). The configuration is based on [Nuxt team recommendations](https://nuxt.com/docs/4.x/getting-started/testing) and our best judgement.

To add/override your custom config, you can create a file named `vitest.config.ts` in the root of your project with the following content:

```ts
import { loadVitestConfig } from './app/utils/vitest-config'

export default loadVitestConfig({
  // your custom config here
})
```

And pass whatever you want as a parameter object. It will be defu-merged with the defaults (custom config takes precedence).

Alternatively, if you don't want to use any part of the `nuxt-spec` default configuration, you can override `vitest.config.ts` file completely and define your own [Vitest configuration](https://vitest.dev/config/) from scratch.

## Contact

Use GitHub issues to report bugs or suggest improvements. I will be more than happy to address them.
