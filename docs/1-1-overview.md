# Nuxt Spec

![Nuxt Spec](https://raw.githubusercontent.com/AloisSeckar/nuxt-spec/refs/heads/main/public/nuxt-spec.png)

A _"testing done right"_ Nuxt base layer.

## How to use?

Aside from being forked and adjusted as you see fit, `nuxt-spec` is also available as an [NPM package](https://www.npmjs.com/package/nuxt-spec) that can be referenced as a single-import with all the features incoming.

Proceed to the [installation guide](1-2-installation.html) to see how to set it up in your project.

## Why?

**Nuxt Spec** (aka `nuxt-spec`) is a base layer for [Nuxt](https://nuxt.com/) applications that brings together several frequently used testing libraries and provides extra utility functions to make Nuxt testing easier. I created this project in early 2025 because I was unable to find a convenient _"single-dependency"_ way to start testing my Nuxt apps. I didn't want to repeat the same steps and maintain the same dependencies over and over.

While Nuxt itself does have a [dedicated module for testing](https://nuxt.com/docs/getting-started/testing), to remain as versatile as possible, it has to be combined with other packages (which can be different based on your choice). I am trying to overcome this by defining **"The Way"**. This is both the strength and the weakness of this project. You were warned.

The most important client of `nuxt-spec` is my [Nuxt Ignis](https://github.com/AloisSeckar/nuxt-ignis) template starter that adds up even more ready-to-use cool stuff for your future awesome Nuxt websites.

## Stack

**Nuxt Spec** currently contains:

- [vitest](https://www.npmjs.com/package/vitest) **v4** as the fundamental testing framework
- [@vitest/browser](https://www.npmjs.com/package/@vitest/browser) as more advanced browser-native testing runner
- [@vitest/ui](https://www.npmjs.com/package/@vitest/ui) as a graphical UI for the Vitest test runner
- [happy-dom](https://www.npmjs.com/package/happy-dom) as the headless browser runtime
- [playwright-core](https://www.npmjs.com/package/playwright-core) as the headless browser testing framework
- [@vue/test-utils](https://www.npmjs.com/package/@vue/test-utils) for testing Vue stuff
- [@nuxt/test-utils](https://www.npmjs.com/package/@nuxt/test-utils) for testing Nuxt stuff

Planned future development:

- reason about (not) using Vitest browser mode (or make it optional)
- a solution for visual regression testing (currently there is an experimental custom solution)

See [CHANGELOG.html](3-1-changelog.html) for the latest updates and features.

## More info

- Continue to the [configuration](2-1-configuration.html) to see how you can adjust the default settings.
- See [changelog](3-1-changelog.html) to view the latest changes.
- Visit [contributing guide](4-1-contributing.html) if you want to help with development.
