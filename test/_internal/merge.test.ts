// internal unit tests for "/config/merge.ts"

import { describe, expect, test } from 'vitest'
import { mergeConfig } from '../../config/merge.js'
import { defineConfig } from 'vitest/config'

describe('Test `mergeConfig` function', () => {
  test('should be defined', () => {
    expect(mergeConfig).toBeDefined()
  })

  test('should merge `projects` correctly', () => {
    const defaultConfig = {
      projects: [
        { name: 'project1', value: 1 },
        { name: 'project2', value: 2 },
      ],
    }

    const userConfig = {
      projects: [
        { name: 'project1', value: 10 },
        { name: 'project3', value: 3 },
      ],
    }

    const mergedConfig = mergeConfig(userConfig, defaultConfig)

    expect(mergedConfig.projects).toEqual([
      { name: 'project1', value: 10 },
      { name: 'project2', value: 2 },
      { name: 'project3', value: 3 },
    ])
  })

  test('should merge `test.projects` correctly', () => {
    const defaultConfig = {
      test: {
        projects: [
          { name: 'project1', value: 1 },
          { name: 'project2', value: 2 },
        ],
      },
    }

    const userConfig = {
      test: {
        projects: [
          { name: 'project1', value: 10 },
          { name: 'project3', value: 3 },
        ],
      },
    }

    const mergedConfig = mergeConfig(userConfig, defaultConfig)

    expect(mergedConfig.test.projects).toEqual([
      { name: 'project1', value: 10 },
      { name: 'project2', value: 2 },
      { name: 'project3', value: 3 },
    ])
  })

  test('should merge real Vitest config with single project correctly', () => {
    const defaultConfig = {
      test: {
        projects: [
          {
            test: {
              name: 'default',
              include: ['/**/*.{test,spec}.ts'],
              environment: 'node',
              pool: 'threads',
            },
          },
        ],
      },
    }

    const userConfig = {
      test: {
        projects: [
          {
            test: {
              name: 'default',
              include: ['/test/*.{test,spec}.ts'],
              environment: 'nuxt',
              customOption: true,
            },
          },
        ],
      },
    }

    const mergedConfig = mergeConfig(userConfig, defineConfig(defaultConfig))

    expect(mergedConfig.test.projects).toEqual([
      {
        test: {
          name: 'default',
          include: ['/test/*.{test,spec}.ts'],
          environment: 'nuxt',
          pool: 'threads',
          customOption: true,
        },
      },
    ])
  })
  
  test('should merge real Vitest config with multiple projects correctly', () => {
    const defaultConfig = {
      test: {
        projects: [
          {
            test: {
              name: 'default',
              include: ['{test,tests}/**/*.{test,spec}.ts', '!test/{browser,e2e,nuxt,unit}/**'],
              environment: 'node',
            },
          },
          {
            test: {
              name: 'e2e',
              include: ['test/e2e/**/*.{test,spec}.ts'],
              environment: 'node',
            },
          },
        ],
      },
    }

    const userConfig = {
      test: {
        projects: [
          {
            test: {
              name: 'default',
              exclude: ['**/playwright/**'],
            },
          },
          {
            test: {
              name: 'e2e',
              include: ['test/e2e/**/*.{test,spec}.ts'],
              environment: 'node',
            },
          },
        ],
      },
    }

    const mergedConfig = mergeConfig(userConfig, defineConfig(defaultConfig))

    expect(mergedConfig.test.projects).toEqual([
      {
        test: {
          name: 'default',
          include: ['{test,tests}/**/*.{test,spec}.ts', '!test/{browser,e2e,nuxt,unit}/**'],
          exclude: ['**/playwright/**'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
    ])
  })

  test('should override nested "browser.instances" in real Vitest config correctly', () => {
    const defaultConfig = {
      test: {
        projects: [
          {
            test: {
              browser: {
                instances: [{
                  browser: 'chromium',
                  viewport: { width: 1280, height: 720 },
                }],
              },
            },
          },
        ],
      },
    }

    const userConfig = {
      test: {
        projects: [
          {
            test: {
              browser: {
                instances: [
                  {
                    browser: 'chromium',
                    viewport: { width: 800, height: 600 },
                  },
                  {
                    browser: 'firefox',
                    viewport: { width: 800, height: 600 },
                  },
                ],
              },
            },
          },
        ],
      },
    }

    const mergedConfig = mergeConfig(userConfig, defaultConfig)

    expect(mergedConfig.test.projects).toEqual([
      {
        test: {
          browser: {
            instances: [
              {
                browser: 'chromium',
                viewport: { width: 800, height: 600 },
              },
              {
                browser: 'firefox',
                viewport: { width: 800, height: 600 },
              },
            ],
          },
        },
      },
    ])
  })

  test('should handle plugin definition in real Vitest config correctly', () => {
    const defaultConfig = {
      test: {
        projects: [
          {
            plugins: ['vue'],
            test: {
              name: 'default',
            },
          },
        ],
      },
    }

    const userConfig = {
      test: {
        projects: [
          {
            plugins: ['euv'],
            test: {
              name: 'default',
            },
          },
        ],
      },
    }

    const mergedConfig = mergeConfig(userConfig, defaultConfig)

    expect(mergedConfig.test.projects).toEqual([
      {
        plugins: [
          'euv',
          'vue',
        ],
        test: {
          name: 'default',
        },
      },
    ])
  })
})
