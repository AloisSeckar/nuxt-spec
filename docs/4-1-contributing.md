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
node ../bin/cli.js setup true pnpm  # test setting nuxt-spec up
node ../bin/cli.js update true pnpm # test updating existing project
```
