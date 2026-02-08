// this is same file as ../nuxt-unit.test.ts )
// here we ensure it is being picked up from nested folder
// see https://github.com/AloisSeckar/nuxt-spec/issues/26

import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'

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
