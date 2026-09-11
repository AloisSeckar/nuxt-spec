// testing Nuxt components in isolation
// test env is set to 'nuxt' for better integration

import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'

// replace with your component
import { NuxtSpecTestComponent } from 'nuxt-spec/components'

const text = 'custom-text'

describe('NuxtSpecTestComponent', () => {
  test('component mounts and renders text properly', () => {
    // NOTE: plain `mount` would only work if the component does not rely
    // on Nuxt-specific features (auto-imports, modules, etc.)
    const wrapper = mount(NuxtSpecTestComponent, {
      propsData: {
        text,
      },
    })
    expect(wrapper.text()).toContain(text)
  })

  test('component mounts using mountSuspended and renders text properly', async () => {
    // NOTE: using `mountSuspended` will properly initialize all aspects
    // of the underlying Nuxt app, if component requires it
    const component = await mountSuspended(NuxtSpecTestComponent, {
      props: {
        text,
      },
    })
    expect(component.html()).toContain(text)
  })
})
