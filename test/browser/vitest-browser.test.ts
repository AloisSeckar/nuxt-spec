// render component using built-in vue-specific `render` function
// this is an alternative to setup proposed in /test/nuxt/**

import { expect, test } from 'vitest'
import { render } from 'vitest-browser-vue'

// replace with your component
import { NuxtSpecTestComponent } from 'nuxt-spec/components'

test('properly handles v-model', async () => {
  const screen = await render(NuxtSpecTestComponent)

  // test by parsing HTML content
  await expect.element(screen.getByText('nuxt-spec')).toBeInTheDocument()

  // screenshot capture for visual regression testing
  // NOTE:
  // by default, the folder is: test\browser\__screenshots__\<TEST_FILE_NAME>
  // by default, the file name is: test-component-chromium-<OS>.png
  // if ran on different platforms, more files are being generated
  await expect(screen.getByTestId('test-component')).toMatchScreenshot('test-component')
})
