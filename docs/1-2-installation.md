# Installation

## From CLI

The `nuxt-spec` package comes with a built-in CLI tool that can help you:

- setup the dependency in your project
- scaffold the default `vitest.config.ts` (see [configuration](2-1-configuration.html) section)
- add some test-related shorthands in your `package.json` (see [running tests](#running-tests) section)
- create demo test files in proposed file structure

To use it, just run the CLI script in your terminal:

::: code-group

```sh [pnpm]
pnpx nuxt-spec setup
```

```sh [npm]
npx nuxt-spec setup
```

```sh [yarn]
yarn dlx nuxt-spec setup
```

```sh [bun]
bunx nuxt-spec setup
```

```sh [deno]
deno run -A npm:nuxt-spec setup
```

:::

First, the CLI tool will ask you whether you want to do the setup automatically. If you choose `y`es, it will perform all the steps for you. If you choose `n`o, it will guide you through the manual setup step-by-step (see [manual setup](#manual-setup) section).

Continue to [Install instructions](#install-and-execute)

### Manual setup

If you don't want to use the CLI tool, or you want to understand its flow better, here are detailed explanations of the required/recommended steps:

**1)** Add the following dependency to your `package.json`:

```json
"nuxt-spec": "0.3.0"
```

It is also advised to remove all explicit `nuxt`, `vue`, and `vue-router` dependencies, if present. The `nuxt-spec` layer includes all of them, and there might be version clashes if they are defined in both places.

**2)** Add the following section to your `nuxt.config.ts`:

```ts
extends: [
  'nuxt-spec'
]
```

**3)** If `pnpm` is used, add a `pnpm-workspace.yaml` file with the following content (if you don't have it yet):

```yaml
shamefullyHoist: true
```

This will ensure the dependencies will be pulled into your project without having to explicitly define them in your `package.json` file.

**4)** Add a `vitest.config.ts` file with the following content (if you don't have it yet):

```ts
import { loadVitestConfig } from 'nuxt-spec/config'

export default loadVitestConfig({
  // your custom config here
})
```

This is a wrapper around native Vitest config allowing to merge your custom configs with `nuxt-spec` defaults. See [configuration](2-1-configuration.html) section for more info.

**5)** Add a `.nuxtrc` file with the following content (if you don't have it yet):

```text
setups.@nuxt/test-utils="4.0.3"
```

Nuxt will auto-generate the file anyway if you do not create it.

**6)** (Optional) Add the following scripts to your `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test-u": "vitest run -u",
  "test-i": "vitest"
}
```

Those are just shorthands for running tests which you may or may not want to use.

**7)** (Optional) Set up the file structure for tests as follows:

```text
test/
├── browser/
│   └── vitest-browser.test.ts
├── e2e/
│   └── nuxt-e2e.test.ts
│   └── nuxt-visual.test.ts
├── nuxt/
│   └── nuxt-unit.test.ts
└── unit/
    └── vitest-unit.test.ts
```

You can use sample files from the [project repository](https://github.com/AloisSeckar/nuxt-spec/tree/v0.3.0/test).

The structure matches the default [configuration](2-1-configuration.html) of `nuxt-spec`.

## Install and execute

Whether you used the CLI tool or did the manual setup, you are ready to install and run the tests.

**1)** Install the dependencies:

It is advised to remove `node_modules` and delete the lock file first. Then proceed with a fresh installation.

::: code-group

```sh [pnpm]
pnpm install
```

```sh [npm]
npm install
```

```sh [yarn]
yarn install
```

```sh [bun]
bun install
```

```sh [deno]
deno install
```

:::

**2)** If you're prompted (for the first time when installing on a new machine, or after a version update), install the headless browser runtimes locally:

::: code-group

```sh [pnpm]
pnpx playwright-core install
```

```sh [npm]
npx playwright-core install
```

```sh [yarn]
yarn dlx playwright-core install
```

```sh [bun]
bunx playwright-core install
```

```sh [deno]
deno run -A npm:playwright-core install
```

:::

**3)** Start the development server of your Nuxt project:

::: code-group

```sh [pnpm]
pnpm dev
```

```sh [npm]
npm run dev
```

```sh [yarn]
yarn dev
```

```sh [bun]
bun run dev
```

```sh [deno]
deno task dev
```

:::

This is required so all auto-generated files are emitted and all the features and type inference work properly.

## Running tests

Once installed, Vitest automatically discovers all `*.test.ts` and `*.spec.ts` files in the project and becomes capable of running them.

You can use those three optional commands in your `package.json` file in the `"scripts"` section in order to run tests easily:

- `test: vitest run` - runs once and ends
- `test-u: vitest run -u` - runs once and updates snapshots
- `test-i: vitest` - runs and waits in HMR mode for test file changes

Then you can run them from the root of your project:

::: code-group

```sh [pnpm]
pnpm test        # runs once and ends
pnpm test-u      # runs once and updates snapshots
pnpm test-i      # runs and waits in HMR mode
```

```sh [npm]
npm run test     # runs once and ends
npm run test-u   # runs once and updates snapshots
npm run test-i   # runs and waits in HMR mode
```

```sh [yarn]
yarn test        # runs once and ends
yarn test-u      # runs once and updates snapshots
yarn test-i      # runs and waits in HMR mode
```

```sh [bun]
bun run test     # runs once and ends
bun run test-u   # runs once and updates snapshots
bun run test-i   # runs and waits in HMR mode
```

```sh [deno]
deno task test    # runs once and ends
deno task test-u  # runs once and updates snapshots
deno task test-i  # runs and waits in HMR mode
```

:::

Or you can use the `vitest` command directly with all its parameters. See [Vitest CLI documentation](https://vitest.dev/guide/cli.html) for more info.

## More info

- Continue to the [configuration](2-1-configuration.html) to see how you can adjust the default settings.
- See [changelog](3-1-changelog.html) to display the latest changes.
- Visit [contributing guide](4-1-contributing.html) if you want to help with development.
