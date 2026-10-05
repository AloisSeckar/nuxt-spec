export type HtmlReportOpenMode = 'always' | 'failed' | 'never'

/**
 * Nuxt Spec options set via `spec` key in nuxt.config.ts.
 * Each option can also be set via respective NUXT_SPEC_* env variable,
 * which takes precedence over the value from nuxt.config.ts.
 */
export interface NuxtSpecOptions {
  /**
   * Include `@nuxt/hints` module.
   * Env: `NUXT_SPEC_HINTS_ENABLED`
   * @default true
   */
  hints?: boolean
  /**
   * WebSocket endpoint of an external Playwright server used by `e2e` and `browser` projects.
   * Env: `NUXT_SPEC_EXTERNAL_PLAYWRIGHT`
   */
  externalPlaywright?: string
  /** HTML test report settings */
  htmlReport?: {
    /**
     * Generate HTML report after each test run.
     * Env: `NUXT_SPEC_HTML_REPORT`
     * @default true
     */
    enabled?: boolean
    /**
     * When to open the report in the default browser.
     * Env: `NUXT_SPEC_HTML_REPORT_OPEN`
     * @default 'failed'
     */
    open?: HtmlReportOpenMode
  }
  /**
   * Plain text patterns of log messages that should be omitted.
   * Env: `NUXT_SPEC_MESSAGE_FILTERS` (comma-separated, added to values from nuxt.config.ts)
   */
  messageFilters?: string[]
}

export interface ResolvedNuxtSpecOptions {
  hints: boolean
  externalPlaywright: string | undefined
  htmlReport: {
    enabled: boolean
    /** not validated here, invalid values fall back to `failed` when the report is evaluated */
    open: string
  }
  messageFilters: string[]
}

export declare const NUXT_SPEC_DEFAULTS: ResolvedNuxtSpecOptions

export declare function resolveSpecOptions(
  fromConfig?: NuxtSpecOptions | false | null,
  env?: Record<string, string | undefined>,
): ResolvedNuxtSpecOptions

export declare function loadSpecOptions(cwd?: string): Promise<ResolvedNuxtSpecOptions>
