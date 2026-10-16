# Contributing Guide

Contributions are welcome. Let's make this project better together.

See <https://github.com/AloisSeckar> for more info.

TODO :(

## Playground

A playground app is included in the `/playground` folder. It is nothing but a Nuxt starter project from the official template. CLI scripts and latest features can be tested against it locally.

**WARNING**: The folder is Git tracked. **Be sure to ALWAYS revert changes and NEVER commit them!**

### Test CLI scripts locally

```sh
cd playground
node ../cli/nuxt-spec.js setup true pnpm  # test setting nuxt-spec up
node ../cli/nuxt-spec.js update true pnpm # test updating existing project
```

## Publishing

The CLI tool lives in the `/cli` folder as a separate `nuxt-spec-cli` package. Both packages are always released together under the same version:

1. bump `version` in both `package.json` and `cli/package.json` to the same value
2. run `pnpm release` (extra args are passed to `pnpm publish`, e.g. `pnpm release --tag alpha`)

The release script verifies the versions match and runs `pnpm -r publish`, which publishes both packages in one go. Running `pnpm publish` directly is blocked.
