// testing the behavior of the whole application
// test env is set to 'node' to simulate the real environment

import { setup, $fetch, createPage, url } from '@nuxt/test-utils/e2e'
import { describe, expect, test } from 'vitest'
import { getDataHtml, getAPIResultHtml } from 'nuxt-spec/utils'

describe('Nuxt Spec E2E test', async () => {
  // setup app.vue in headless browser
  await setup()

  test('component renders in browser', async () => {
    // fetch for the rendered value
    const html = await $fetch('/')
    expect(html).toContain('<!DOCTYPE html>')
  })

  test('with playwright', async () => {
    // render page in headless browser
    const page = await createPage()
    await page.goto(url('/'), { waitUntil: 'hydration' })
    const html = await page.content()
    expect(html).toContain('<!DOCTYPE html>')

    // test html extraction util function
    // 1 - pass existing page instance
    const dataHtml1 = await getDataHtml(page, '#test')
    expect(dataHtml1).toEqual('Test Component')
    // 2 - pass url string
    const dataHtml2 = await getDataHtml('/', '#test')
    expect(dataHtml2).toEqual('Test Component')

    // test API call and response extraction
    const apiResultHtml = await getAPIResultHtml('/', '#api-fetch', 'jsonplaceholder.typicode.com/posts', '#api-result')
    expect(apiResultHtml).toContain('"userId": 1')
    expect(apiResultHtml).toContain('id": 1')
  })
})
