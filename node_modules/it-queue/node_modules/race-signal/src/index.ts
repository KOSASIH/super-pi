/**
 * @packageDocumentation
 *
 * Pass a promise and an abort signal and await the result.
 *
 * @example Basic usage
 *
 * ```ts
 * import { raceSignal } from 'race-signal'
 *
 * const controller = new AbortController()
 *
 * const promise = new Promise((resolve, reject) => {
 *   setTimeout(() => {
 *     resolve('a value')
 *   }, 1000)
 * })
 *
 * setTimeout(() => {
 *   controller.abort()
 * }, 500)
 *
 * // throws an AbortError
 * const resolve = await raceSignal(promise, controller.signal)
 * ```
 *
 * @example Overriding errors
 *
 * By default the thrown error is the `.reason` property of the signal but it's
 * possible to override this behaviour with the `translateError` option:
 *
 * ```ts
 * import { raceSignal } from 'race-signal'
 *
 * const controller = new AbortController()
 *
 * const promise = new Promise((resolve, reject) => {
 *   setTimeout(() => {
 *     resolve('a value')
 *   }, 1000)
 * })
 *
 * setTimeout(() => {
 *   controller.abort()
 * }, 500)
 *
 * // throws `Error('Oh no!')`
 * const resolve = await raceSignal(promise, controller.signal, {
 *   translateError: (signal) => {
 *     // use `signal`, or don't
 *     return new Error('Oh no!')
 *   }
 * })
 * ```
 */

export interface RaceSignalOptions {
  /**
   * By default the rejection reason will be taken from the `.reason` field of
   * the aborted signal.
   *
   * Passing a function here allows overriding the default error.
   */
  translateError?(signal: AbortSignal): Error
}

function defaultTranslate (signal: AbortSignal): Error {
  return signal.reason
}

/**
 * Race a promise against an abort signal
 */
export async function raceSignal <T> (promise: Promise<T>, signal?: AbortSignal, opts?: RaceSignalOptions): Promise<T> {
  if (signal == null) {
    return promise
  }

  const translateError = opts?.translateError ?? defaultTranslate

  if (signal.aborted) {
    // the passed promise may yet resolve or reject but the use has signalled
    // they are no longer interested so smother the error
    promise.catch(() => {})
    return Promise.reject(translateError(signal))
  }

  let listener

  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve, reject) => {
        listener = () => {
          reject(translateError(signal))
        }
        signal.addEventListener('abort', listener)
      })
    ])
  } finally {
    if (listener != null) {
      signal.removeEventListener('abort', listener)
    }
  }
}
