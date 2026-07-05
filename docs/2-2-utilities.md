# Nuxt Spec utilities

Nuxt Spec offers a couple of utility functions that are exported via `nuxt-spec/utils` subpackage.

You can use them in your test files as follows:

```ts
import { compareScreenshot, gotoPage, getDataHtml, getAPIResultHtml, } from 'nuxt-spec/utils'

// accepts instance of NuxtPage (from @nuxt/test-utils)
// takes a screenshot of current viewport and compares it with stored baseline
// the comparison is done using `pixelmatch` library
// if screenshot doesn't exist, it will be created in __baseline__ subfolder
// screenshot from current run is always captured into __current__ subfolder
// if screenshots don't match, the method will cause Vitest test to fail
// accepts optional object with extra options:
// - `fileName` - name of the screenshot file (default is based on current route)
// - `selector` - CSS selector of the element to capture (default is full page)
// - `targetDir` - directory where the screenshots should be stored (default is `./test/e2e/`)
// - `maxDiffPixelRatio` - allows mitigating cross-platform rendering differences by setting 
//                         a 0-1 scale tolerance (default 0)
// - `maxDiffPixels` - same but with exact max value of different pixels which overrides setting
//                     `maxDiffPixelRatio` (default 0)
// - `threshold` - allows adjusting the tolerance for "same" color on 0-1 scale (default 0.1)

// will produce "index.png" file in `./test/e2e/` directory
await compareScreenshot(page)
// will produce "homepage.png"
await compareScreenshot(page, { fileName: 'homepage.png' })
// will produce "component.png" only with id="test" element
await compareScreenshot(page, { fileName: 'component.png', selector: '#test' })
// will produce "homepage.png" in `/screenshots` directory
await compareScreenshot(page, { fileName: 'homepage.png', targetDir: '/screenshots' })
// will produce "homepage.png" and the comparison will only fail when more than 1000 pixels differ
await compareScreenshot(page, { fileName: 'homepage.png', maxDiffPixels: 1000 }) 
// will produce "homepage.png", the comparison will only fail when more than 1000 pixels differ
// while more pixels will be considered "same" based on color
await compareScreenshot(page, { fileName: 'homepage.png', maxDiffPixels: 1000, threshold: 0.5 }) 

// navigates to given URL and returns the instance of NuxtPage (from @nuxt/test-utils)
const page: NuxtPage = await gotoPage('url')

// accepts either a URL string or instance of NuxtPage (from @nuxt/test-utils) and a CSS selector
// returns `innerHTML` of the element matching the selector
const html: string = await getDataHtml('/', '#test') 
const html: string = await getDataHtml(page, '#test')

// accepts either a URL string or instance of NuxtPage (from @nuxt/test-utils)
// css selector for element that triggers API call when clicked (i.e. button)
// fragment of API endpoint URL that should be called (to test the response)
// css selector for element where the API response should be rendered (i.e. div)
// returns `innerHTML` of the element matching the result selector after the API call 
// is made by Playwright runner
const html: string = await getAPIResultHtml('/', '#api-fetch', '/your-api', '#api-result')
const html: string = await getAPIResultHtml(page, '#api-fetch', '/your-api', '#api-result')
```

For detailed description, see [utils.d.ts](https://github.com/AloisSeckar/nuxt-spec/blob/v0.2.4/utils/index.d.ts).

The `compareScreenshot` function usage results into HTML report file being automatically created. The file is generated within the specified `__current__` directory as `report_YYYYMMDDHHMMSS.html`. It contains all failed screenshots comparison. When test suite is over, file is attempted to be opened in system default browser (unless Node operates in `CI` mode).

### Notice on concurrent execution

The default setting for `e2e` project sets `maxConcurrency: availableParallelism() / 2` which is based on function provided by `node:os` module. You should adjust your tests to match this value or override the default if needed.

### Notice on non-default setups

The creation of the report file and it's proper wrap-up at the end is ensured via `globalSetup` function passed into default Vitest E2E suite defined by Nuxt Spec. If you need to override the default `e2e` project, you also need to make sure to call the setup function manually.

Add following into your `vitest.config.ts`:

```ts
// vitest.config.ts
import { loadVitestConfig } from 'nuxt-spec/config'

// resolve path to Nuxt Spec's setup function
const screenshotReportSetup = fileURLToPath(new URL('../utils/screenshot.ts', import.meta.resolve('nuxt-spec/config')))

export default loadVitestConfig({
  // whatever e2e test you are defining
  test: {
    // provide it to your `compareScreenshot` using test suite
    globalSetup: [screenshotReportSetup],
    // other config
  },
  // other config
})
```
