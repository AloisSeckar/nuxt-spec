import { defineConfig, type Plugin } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Nuxt Spec',
  description: 'A "testing done right" Nuxt base layer',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Overview', link: '/1-1-overview' },
      { text: 'Configuration', link: '/2-1-configuration' },
      { text: 'Changelog', link: '/3-1-changelog' },
      { text: 'Contributing', link: '/4-1-contributing' },
    ],

    sidebar: [
      {
        text: 'Get started',
        items: [
          { text: 'Overview', link: '/1-1-overview' },
          { text: 'Installation', link: '/1-2-installation' },
        ],
      },
      {
        text: 'Features',
        items: [
          { text: 'Configuration', link: '/2-1-configuration' },
          { text: 'Utilities', link: '/2-2-utilities' },
        ],
      },
      {
        text: 'Changelog',
        items: [
          { text: 'Changelog', link: '/3-1-changelog' },
        ],
      },
      {
        text: 'Contributing',
        items: [
          { text: 'Contributing guide', link: '/4-1-contributing' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/AloisSeckar/nuxt-spec' },
    ],

    footer: {
      message: 'Released under the <a href="https://github.com/AloisSeckar/nuxt-spec/blob/master/LICENSE">MIT License</a>',
      copyright: 'Copyright © 2025-present <a href="https://alois-seckar.cz/">Alois Sečkár</a>',
    },
  },

  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },

  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          // in case custom icons are needed...
        },
      }) as Plugin,
    ],
  },
})
