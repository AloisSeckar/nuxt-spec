# Nuxt Spec

![Nuxt Spec](https://github.com/AloisSeckar/nuxt-spec/blob/main/public/nuxt-spec.png)

**Nuxt Spec** (aka `nuxt-spec`) is a base layer for [Nuxt](https://nuxt.com/) applications incorporating together a couple of testing libraries and packages and providing some utility functions. I created this project in early 2025 because I was unable to find a convenient "one-dependency" way to start testing my Nuxt apps and I didn't want to repeat the same steps and maintain the same set of dependencies over and over. 

While Nuxt itself does have a [dedicated module for testing](https://nuxt.com/docs/getting-started/testing), to remain as versatile as possible, it has to be combined with other packages (which can be different based on your choice). I am trying to overcome this by defining "the way". This is both the strength and the weakness of this project. You were warned.

The most important client of `nuxt-spec` is my [Nuxt Ignis](https://github.com/AloisSeckar/nuxt-ignis) template starter that adds up even more ready-to-use cool stuff for your future awesome Nuxt websites.


## How to use

Aside from being "forked" and used as you seem fit, `nuxt-spec` is also available as an [NPM package](https://www.npmjs.com/package/nuxt-spec) that can be referenced as a single-import with all the features incoming.

1) Add following dependency into your `package.json`:
```
"nuxt-spec": "0.0.1"
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


## Overview

**Nuxt T(est)** currently contains:
- [vitest](https://www.npmjs.com/package/vitest) as the fundamental testing framework
- [happy-dom](https://www.npmjs.com/package/happy-dom) as the headless browser runtime
- [playwright-core](https://www.npmjs.com/package/vitest) as the headless browser testing framework
- [@vue/test-utils](https://www.npmjs.com/package/@vue/test-utils) for testing Vue stuff
- [@nuxt/test-utils](https://www.npmjs.com/package/@nuxt/test-utils) for testing Nuxt stuff

Planned future content:
- [backstopjs](https://www.npmjs.com/package/backstopjs) as the solution for visual testing


## Contact

Use GitHub issues to report bugs or suggest improvements. I will be more than happy to address them.
