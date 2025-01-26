import { setup, $fetch, createPage, url } from '@nuxt/test-utils/e2e'
import { describe, expect, test } from 'vitest'

describe('NuxtTestComponent E2E test', async () => {
  // setup app.vue in headless browser
  await setup()

  // TODO tests broken
  // Cannot find module '<local_path>\.nuxt\test\83opp2\output\server\node_modules\vue\server-renderer\index.mjs'
  //  imported from <local_path>\.nuxt\test\83opp2\output\server\chunks\routes\renderer.mjs

  test('component renders in browser', async () => {
    // fetch for the rendered value
    const html = await $fetch('/')
    expect(html).toContain('nuxt-spec')
  })

  test('with playwright', async () => {
    const page = await createPage()
    await page.goto(url('/'), { waitUntil: 'hydration' })
    const text = page.textContent('div')
    console.log(text)
  })
})
