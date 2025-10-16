// testing Nuxt components in isolation
// test env is set to 'nuxt' for better integration

import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'

// @ts-ignore error - see https://github.com/AloisSeckar/nuxt-spec/issues/17
import { NuxtSpecTestComponent } from '#components' // replace with your component (`nuxt dev` must run first to create the reference)

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
