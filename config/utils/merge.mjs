// custom merger function based on defu
// allows working with the "projects" array properly
// user-defined config overrides are merged by "name"

// for consistent and predictable results, passing "include" or "browser.instances"
// will result in OVERRIDE instead of merging with nuxt-spec defaults

import { createDefu } from 'defu'

// in real Vitest config, "name" is nested inside another "test" object
const getProjectName = (project) => project?.name ?? project?.test?.name

export const mergeConfig = createDefu((obj, key, value) => {
  if (key === 'projects' && Array.isArray(obj[key]) && Array.isArray(value)) {
    const defaults = obj[key]
    const overrides = value

    // override default values if user-defined config specifies them
    obj[key] = defaults.map((defaultProject) => {
      const override = overrides.find(o => getProjectName(o) === getProjectName(defaultProject))
      return override ? mergeProject(override, defaultProject) : defaultProject
    })

    // add any user projects that don't exist in defaults
    for (const override of overrides) {
      if (!defaults.some(d => getProjectName(d) === getProjectName(override))) {
        obj[key].push(override)
      }
    }

    return true
  }
})

// Keys where user value should fully replace the default, not merge
const overrideKeys = new Set(['include', 'instances'])

const mergeProject = createDefu((obj, key, value) => {
  if (overrideKeys.has(key)) {
    obj[key] = value
    return true
  }
})
