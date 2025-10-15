// testing Nuxt components in isolation
// test env is set to 'nuxt' for better integration

import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import NuxtSpecTestComponent from '../../app/components/NuxtSpecTestComponent.vue'

const text = 'custom-text'

describe('NuxtSpecTestComponent', () => {
  test('component mounts and renders text properly', () => {
    const wrapper = mount(NuxtSpecTestComponent, {
      propsData: {
        text,
      },
    })
    expect(wrapper.text()).toContain(text)
  })

  test('component mounts using mountSuspended and renders text properly', async () => {
    const component = await mountSuspended(NuxtSpecTestComponent, {
      props: {
        text,
      },
    })
    expect(component.html()).toContain(text)
  })
})
