import { createPage, url } from '@nuxt/test-utils/e2e'
import type { GotoOptions, NuxtPage } from '@nuxt/test-utils'
import { checkPageParam, checkStringParam } from './helpers/check-params'

/**
 * Extra settings object for `gotoPage()` function.
 * All properties are optional.
 */
export type GotoPageOptions = {
  /** Event to be awaited before NuxtPage instance is returned (defaults to `'hydration'`) */
  waitUntil?: GotoOptions['waitUntil']
}

/**
 * Visit a specified URL and return the page instance for further interaction.
 *
 * @param pageName - Path segment appended to the base URL (e.g. `'about'` → `/<about>`)
 * @param options - Optional extra settings (see `GotoPageOptions`)
 * @returns Playwright page instance after navigation and `hydration` event
 */
export async function gotoPage(pageName: string, options?: GotoPageOptions): Promise<NuxtPage> {
  const { waitUntil } = options ?? {}

  // verify params
  checkStringParam('gotoPage:pageName', pageName)
  if (waitUntil) {
    checkStringParam('gotoPage:options.waitUntil', waitUntil)
  }

  // construct NuxtPage instance
  const page = await createPage()
  const urlPath = pageName.startsWith('/') ? url(pageName) : url(`/${pageName}`)
  await page.goto(urlPath, { waitUntil: waitUntil ?? 'hydration' })

  return page
}

/**
 * Extra settings object for `getDataHtml()` function.
 * All properties are optional.
 */
export type GetDataHtmlOptions = {
  /** Event to be awaited before NuxtPage instance is returned (defaults to `'hydration'`) */
  waitUntil?: GotoOptions['waitUntil']
  /** CSS selector identifying the target element (defaults to `<body>` tag) */
  element?: string
}

/**
 * Extract inner HTML content from a specified element on a given page.
 * If no element is specified via `options.element`, the entire `<body>` content is returned.
 *
 * @param page - Playwright page instance, or a page name string (will call `gotoPage` internally)
 * @param options - Optional extra settings (see `GetDataHtmlOptions`)
 * @returns The inner HTML of the matched element
 */
export async function getDataHtml(page: NuxtPage | string, options?: GetDataHtmlOptions): Promise<string> {
  const { waitUntil, element } = options ?? {}

  // verify params
  if (typeof page === 'string') {
    checkStringParam('getDataHtml:page', page)
  }
  if (waitUntil) {
    checkStringParam('getDataHtml:options.waitUntil', waitUntil)
  }
  if (element) {
    checkStringParam('getDataHtml:options.element', element)
  }

  // get NuxtPage instance
  const pageInstance = typeof page === 'string' ? await gotoPage(page, { waitUntil }) : page
  checkPageParam('getDataHtml:pageInstance', pageInstance)

  // extract target HTML
  const dataElement = pageInstance.locator(element ?? 'body')
  return await dataElement.innerHTML()
}

/**
 * Extra settings object for `getAPIResultHtml()` function.
 * Due to nature of the function, `triggerElement`, `targetUrl`, and `responseElement` are required.
 */
export type GetAPIResultHtmlOptions = {
  /** Event to be awaited before NuxtPage instance is returned (defaults to `'hydration'`) */
  waitUntil?: GotoOptions['waitUntil']
  /** CSS selector for the clickable element that triggers the API request (required) */
  triggerElement: string
  /** Substring matched against the response URL to identify the expected API call (required) */
  targetUrl: string
  /** CSS selector for the element displaying the API response (required) */
  responseElement: string
}

/**
 * Execute an API call by clicking a trigger element, wait for a successful
 * response matching the target URL, then extract the inner HTML from the
 * response element.
 *
 * @param page - Playwright page instance, or a page name string (will call `gotoPage` internally)
 * @param options - Extra settings (see `GetAPIResultHtmlOptions`)
 * @returns The inner HTML of the response element
 */
export async function getAPIResultHtml(page: NuxtPage | string, options: GetAPIResultHtmlOptions) {
  const { waitUntil, triggerElement, targetUrl, responseElement } = options

  // verify params
  if (typeof page === 'string') {
    checkStringParam('getAPIResultHtml:page', page)
  }
  if (waitUntil) {
    checkStringParam('getAPIResultHtml:options.waitUntil', waitUntil)
  }
  checkStringParam('getAPIResultHtml:triggerElement', triggerElement)
  checkStringParam('getAPIResultHtml:targetUrl', targetUrl)
  checkStringParam('getAPIResultHtml:responseElement', responseElement)

  // get NuxtPage instance
  const pageInstance = typeof page === 'string' ? await gotoPage(page, { waitUntil }) : page
  checkPageParam('getAPIResultHtml:pageInstance', pageInstance)

  // trigger API call
  await pageInstance.click(triggerElement)
  await pageInstance.waitForResponse(response =>
    response.url().includes(targetUrl) && response.ok(),
  )

  // extract target HTML
  const dataElement = pageInstance.locator(responseElement)
  return await dataElement.innerHTML()
}
