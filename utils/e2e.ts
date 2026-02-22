import { createPage, url } from '@nuxt/test-utils/e2e'
import type { NuxtPage } from '@nuxt/test-utils'

// visit a specified URL and return the page instance for further interaction
export async function gotoPage(pageName: string): Promise<NuxtPage> {
  const page = await createPage()
  const urlPath = pageName.startsWith('/') ? url(pageName) : url(`/${pageName}`)
  await page.goto(urlPath, { waitUntil: 'hydration' })
  return page
}

// extract HTML content from specified element on a given page
export async function getDataHtml(page: NuxtPage | string, element: string): Promise<string> {
  const pageInstance = typeof page === 'string' ? await gotoPage(page) : page
  const dataDiv = pageInstance.locator(element)
  return await dataDiv.innerHTML()
}

// execute an API call and extract HTML content from the result
// (assumes clickable element that triggers the request
// and separate element for displaying the response)
export async function getAPIResultHtml(page: NuxtPage | string, triggerElement: string, targetUrl: string, responseElement: string) {
  const pageInstance = typeof page === 'string' ? await gotoPage(page) : page
  await pageInstance.click(triggerElement)
  await pageInstance.waitForResponse(response =>
    response.url().includes(targetUrl) && response.ok(),
  )
  const resultDiv = pageInstance.locator(responseElement)
  return await resultDiv.innerHTML()
}
