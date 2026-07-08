# Nuxt Spec utilities

Nuxt Spec offers a couple of utility functions that are exported via the `nuxt-spec/utils` subpackage.

Currently, four E2E utilities are available:

## `gotoPage`

Navigates to a given URL and returns the instance of `NuxtPage` (from `@nuxt/test-utils`).

```ts
import { gotoPage } from 'nuxt-spec/utils'

const page: NuxtPage = await gotoPage('url')
```

The function assumes there is a Nuxt app instance running. It will use the `createPage` utility from Nuxt Test Utils, await navigation to the given URL, and return the instance for further processing.

An optional second argument accepts an object with following:

- `waitUntil` - (optional) event to be awaited before the `NuxtPage` instance is returned (defaults to `'hydration'` if not set)

```ts
import { gotoPage } from 'nuxt-spec/utils'
  
// wait for a different event before returning NuxtPage instance
const page: NuxtPage = await gotoPage('url', { waitUntil: 'domcontentloaded' })
```

A console warn will be produced, if URL param is not a non-empty string or if waitUntil option is passed and it is not a string.

## `getDataHtml`

Accepts a source (plain URL or instance of `NuxtPage`) and an optional options object. Returns `innerHTML` of the element matching the `element` selector (defaults to the `<body>` tag).

```ts
import { getDataHtml } from 'nuxt-spec/utils'

// plain string URL
// return innerHTML of the whole <body>
const html: string = await getDataHtml('/')

// target a specific element
const html: string = await getDataHtml('/', { element: '#test' })

// target a specific element on already existing Nuxt page instance
const html: string = await getDataHtml(page, { element: '#test' })
```

The options object accepts:

- `waitUntil` - (optional) event to be awaited before the `NuxtPage` instance is returned (defaults to `'hydration'` if not set); only used when `page` is a string and new `NuxtPage` instance is being constructed internally
- `element` - (optional) CSS selector identifying the target element (defaults to `<body>` tag if not set)

A console warn will be produced, if page param is empty or any of the params passed are of invalid data type.

## `getAPIResultHtml`

Accepts:

1. a source (plain URL or instance of `NuxtPage`)
2. an options object describing the API interaction

The options object accepts:

- `triggerElement` (required) - CSS selector for an element that triggers an API call when clicked (i.e., a button)
- `targetUrl` (required) - a fragment of an API endpoint URL that should be called (to test the response)
- `responseElement` (required) - CSS selector for an element where the API response should be rendered (i.e., a div)
- `waitUntil` - (optional) event to be awaited before the `NuxtPage` instance is returned (defaults to `'hydration'` if not set); only used when `page` is a string and new `NuxtPage` instance is being constructed internally

Returns:

- `innerHTML` of the element matching the `responseElement` selector after the API call is made by Playwright runner

```ts
import { getAPIResultHtml } from 'nuxt-spec/utils'

// plain string URL
const html: string = await getAPIResultHtml('/', {
  triggerElement: '#api-fetch',
  targetUrl: '/your-api',
  responseElement: '#api-result',
})

// Nuxt page instance
const html: string = await getAPIResultHtml(page, {
  triggerElement: '#api-fetch',
  targetUrl: '/your-api',
  responseElement: '#api-result',
})
```

The function locates the action element, invokes the action, and listens for the response. If a response is received, it checks whether the returned data URL matches the expected fragment and then returns the `innerHTML` of the result element.

A console warn will be produced, if any of the required params is empty or any of the params passed are of invalid data type.

## `compareScreenshot`

Accepts an instance of `NuxtPage`. Takes a screenshot of the current viewport and compares it with the stored baseline. The comparison is done using the `pixelmatch` library. If the screenshot doesn't exist (or Vitest is configured to auto-update snapshots), it will be created in the __baseline__ subfolder. The screenshot from the current run is always captured into the __current__ subfolder. If the screenshots don't match, the function will cause the Vitest test to fail.

Additionally, the method accepts optional object with extra options:

- `fileName` - name of the screenshot file (default is based on current route)
- `selector` - CSS selector of the element to capture (default is full page)
- `targetDir` - directory where the screenshots should be stored (default is `./test/e2e/`)
- `maxDiffPixelRatio` - allows mitigating cross-platform rendering differences by setting a 0-1 scale tolerance (default 0)
- `maxDiffPixels` - same but with exact max value of different pixels which overrides setting `maxDiffPixelRatio` (default 0)
- `threshold` - allows adjusting the tolerance for "same" color on 0-1 scale (default 0.1)

```ts
import { compareScreenshot } from 'nuxt-spec/utils'

// will produce "index.png" file in `./test/e2e/` directory
await compareScreenshot(page)

// will produce "homepage.png"
await compareScreenshot(page, { 
  fileName: 'homepage.png',
})

// will produce "component.png" only with id="test" element
await compareScreenshot(page, { 
  fileName: 'component.png',
  selector: '#test',
})

// will produce "homepage.png" in `/screenshots` directory
await compareScreenshot(page, { 
  fileName: 'homepage.png',
  targetDir: '/screenshots',
})

// will produce "homepage.png" and the comparison will only fail 
// when more than 1000 pixels differ
await compareScreenshot(page, { 
  fileName: 'homepage.png',
  maxDiffPixels: 1000,
}) 

// will produce "homepage.png", the comparison will only fail 
// when more than 1000 pixels differ while more pixels will
// be considered "same" based on color
await compareScreenshot(page, { 
  fileName: 'homepage.png',
  maxDiffPixels: 1000,
  threshold: 0.5,
}) 
```

A console warn will be produced, if `page` is nullish or of wrong type.

### HTML report file

Any use of the `compareScreenshot` function results in an HTML report file being created automatically. The file is generated within the specified `__current__` directory as `report_YYYYMMDDHHMMSS.html`. It contains all failed screenshot comparisons. When the test suite is over, an attempt is made to open the file in the system default browser (unless Node operates in `CI` mode).

### Notice on concurrent execution

The default setting for the `e2e` project sets `maxConcurrency: availableParallelism() / 2`, which is based on a function provided by the `node:os` module. You should adjust your tests to match this value or override the default if needed.

### Notice on non-default setups

The creation of the report file and its proper wrap-up at the end is ensured via the `globalSetup` function passed into the default Vitest E2E suite defined by Nuxt Spec. If you need to override the default `e2e` project, you also need to make sure to call the setup function manually.

Add the following into your `vitest.config.ts`:

```ts
// vitest.config.ts
import { loadVitestConfig } from 'nuxt-spec/config'

// resolve path to Nuxt Spec's setup function
const pkgRoot = import.meta.resolve('nuxt-spec/config')
const screenshotReportSetup = 
  fileURLToPath(new URL('../utils/screenshot.ts', pkgRoot))

export default loadVitestConfig({
  // whatever e2e test you are defining
  test: {
    // provide it to the test suite that uses `compareScreenshot`
    globalSetup: [screenshotReportSetup],
    // other config
  },
  // other config
})
```
