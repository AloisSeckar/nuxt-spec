import { createPage, url } from '@nuxt/test-utils/e2e'
import type { NuxtPage } from '@nuxt/test-utils'
import { checkPageParam, checkStringParam } from './helpers/check-params'

/**
 * Visit a specified URL and return the page instance for further interaction.
 *
 * @param pageName - Path segment appended to the base URL (e.g. `'about'` → `/<about>`)
 * @returns Playwright page instance after navigation and `hydration` event
 */
export async function gotoPage(pageName: string): Promise<NuxtPage> {
  checkStringParam('gotoPage:pageName', pageName)

  const page = await createPage()
  const urlPath = pageName.startsWith('/') ? url(pageName) : url(`/${pageName}`)
  await page.goto(urlPath, { waitUntil: 'hydration' })
  return page
}

/**
 * Extract inner HTML content from a specified element on a given page.
 *
 * @param page - Playwright page instance, or a page name string (will call `gotoPage` internally)
 * @param element - CSS selector identifying the target element
 * @returns The inner HTML of the matched element
 */
export async function getDataHtml(page: NuxtPage | string, element: string): Promise<string> {
  const pageInstance = typeof page === 'string' ? await gotoPage(page) : page

  checkPageParam('getDataHtml:pageInstance', pageInstance)
  checkStringParam('getDataHtml:element', element)

  const dataDiv = pageInstance.locator(element)
  return await dataDiv.innerHTML()
}

/**
 * Execute an API call by clicking a trigger element, wait for a successful
 * response matching the target URL, then extract the inner HTML from the
 * response element.
 *
 * @param page - Playwright page instance, or a page name string (will call `gotoPage` internally)
 * @param triggerElement - CSS selector for the clickable element that triggers the API request
 * @param targetUrl - Substring matched against the response URL to identify the expected API call
 * @param responseElement - CSS selector for the element displaying the API response
 * @returns The inner HTML of the response element
 */
export async function getAPIResultHtml(page: NuxtPage | string, triggerElement: string, targetUrl: string, responseElement: string) {
  const pageInstance = typeof page === 'string' ? await gotoPage(page) : page

  checkPageParam('getAPIResultHtml:pageInstance', pageInstance)
  checkStringParam('getAPIResultHtml:triggerElement', triggerElement)
  checkStringParam('getAPIResultHtml:targetUrl', targetUrl)
  checkStringParam('getAPIResultHtml:responseElement', responseElement)

  await pageInstance.click(triggerElement)
  await pageInstance.waitForResponse(response =>
    response.url().includes(targetUrl) && response.ok(),
  )
  const resultDiv = pageInstance.locator(responseElement)
  return await resultDiv.innerHTML()
}
