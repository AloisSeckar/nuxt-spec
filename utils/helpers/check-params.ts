import type { NuxtPage } from '@nuxt/test-utils'
import { locationHint } from './location-hint'

// given string param must be an actual non-empty string
export function checkStringParam(paramName: string, paramValue?: string) {
  if (!paramValue) {
    console.warn(`Passed value '${paramName}' is missing or empty.\n${locationHint()}`)
  }
  if (typeof paramValue !== 'string') {
    console.warn(`Passed value '${paramName}' is not a string.\n${locationHint()}`)
  }
}

// given string param must be an actual number
export function checkNumberParam(paramName: string, paramValue?: number) {
  if (paramValue === undefined || paramValue === null) {
    console.warn(`Passed value '${paramName}' is missing or empty.\n${locationHint()}`)
  }
  if (typeof paramValue !== 'number') {
    console.warn(`Passed value '${paramName}' is not a number.\n${locationHint()}`)
  }
}

// given NuxtPage param must be an actual non-nullish NuxtPage instance
export function checkPageParam(paramName: string, paramValue?: NuxtPage) {
  if (!paramValue) {
    console.warn(`Passed value '${paramName}' is missing or empty.\n${locationHint()}`)
  }
  if (typeof paramValue !== 'object') {
    console.warn(`Passed value '${paramName}' is not a NuxtPage.\n${locationHint()}`)
  } else {
    const pageInstance = paramValue as unknown as Record<string, unknown>
    if (
      typeof pageInstance.goto !== 'function'
      || typeof pageInstance.locator !== 'function'
      || typeof pageInstance.waitForResponse !== 'function'
    ) {
      console.warn(`Passed value '${paramName}' is not a NuxtPage.\n${locationHint()}`)
    }
  }
}
