import { setup, $fetch, createPage, url } from '@nuxt/test-utils/e2e'
import { describe, expect, test } from 'vitest'

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
  })
})
