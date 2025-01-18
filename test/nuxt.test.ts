import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import NuxtTestComponent from '../components/NuxtTestComponent.vue'

describe('NuxtTestComponent', () => {
  it('component renders text properly', () => {
    const wrapper = mount(NuxtTestComponent, {
      propsData: {
        text: 'nuxt-spec',
      },
    })
    expect(wrapper.text()).toContain('nuxt-spec')
  })
})
