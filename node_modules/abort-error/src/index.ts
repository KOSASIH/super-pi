/**
 * @packageDocumentation
 *
 * A simple error class and options interface that seems to get copied from
 * project to project.
 *
 * @example Using AbortError
 *
 * ```JavaScript
 * import { AbortError } from 'abort-error'
 *
 * // a promise that will be settled later
 * const deferred = Promise.withResolvers()
 *
 * const signal = AbortSignal.timeout(1000)
 * signal.addEventListener('abort', () => {
 *   deferred.reject(new AbortError())
 * })
 * ```
 *
 * @example Using AbortOptions
 *
 * ```TypeScript
 * import type { AbortOptions } from 'abort-error'
 *
 * async function myFunction (options?: AbortOptions) {
 *   return fetch('https://example.com', {
 *     signal: options?.signal
 *   })
 * }
 * ```
 */

export interface AbortOptions {
  signal?: AbortSignal
}

export class AbortError extends Error {
  static name = 'AbortError'
  name = 'AbortError'

  constructor (message: string = 'The operation was aborted', ...rest: any[]) {
    super(message, ...rest)
  }
}
