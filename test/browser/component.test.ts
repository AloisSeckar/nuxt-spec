// render component using built-in feature

import { expect, test } from 'vitest'
import { render } from 'vitest-browser-vue'
import Component from '../../app/components/NuxtSpecTestComponent.vue'

test('properly handles v-model', async () => {
  const screen = render(Component)

  await expect.element(screen.getByText('nuxt-spec')).toBeInTheDocument()
})
