/**
 * @packageDocumentation
 *
 * - Reads occur concurrently
 * - Writes occur one at a time
 * - No reads occur while a write operation is in progress
 * - Locks can be created with different names
 * - Reads/writes can time out
 *
 * @example
 *
 * ```ts
 * import mortice from 'mortice'
 * import delay from 'delay'
 *
 * // the lock name & options objects are both optional
 * const mutex = mortice()
 *
 * Promise.all([
 *   (async () => {
 *     const release = await mutex.readLock()
 *
 *     try {
 *       console.info('read 1')
 *     } finally {
 *       release()
 *     }
 *   })(),
 *   (async () => {
 *     const release = await mutex.readLock()
 *
 *     try {
 *       console.info('read 2')
 *     } finally {
 *       release()
 *     }
 *   })(),
 *   (async () => {
 *     const release = await mutex.writeLock()
 *
 *     try {
 *       await delay(1000)
 *
 *       console.info('write 1')
 *     } finally {
 *       release()
 *     }
 *   })(),
 *   (async () => {
 *     const release = await mutex.readLock()
 *
 *     try {
 *       console.info('read 3')
 *     } finally {
 *       release()
 *     }
 *   })()
 * ])
 * ```
 *
 *     read 1
 *     read 2
 *     <small pause>
 *     write 1
 *     read 3
 *
 * ## Clean up
 *
 * Mutexes are stored globally reference by name, this is so you can obtain the
 * same lock from different contexts, including workers.
 *
 * When a mutex is no longer required, the `.finalize` function should be called
 * to remove any internal references to it.
 *
 * ```ts
 * import mortice from 'mortice'
 *
 * const mutex = mortice()
 *
 * // ...some time later
 *
 * mutex.finalize()
 * ```
 *
 * ## Auto clean up
 *
 * If your app generates a lot of short-lived mutexes and you want to clean them
 * up after the last lock has been released, pass the `autoFinalize` option to
 * mortice in the owning context:
 *
 ```ts
 * import mortice from 'mortice'
 *
 * const mutex = mortice({
 *   autoFinalize: true
 * })
 *
 * const release = await mutex.readLock()
 * // ...some time later
 *
 * release()
 *
 * // mutex will be freed soon after
 * ```
 *
 * ## React native support
 *
 * This module should run on react native but it only supports single-process
 * concurrency as it's not clear to the author (disclaimer - not a react native
 * dev) what the officially supported process concurrency model is.
 *
 * Please open an issue if this is a feature you would like to see added.
 */

import { Queue } from 'it-queue'
import { createMutex } from './mortice.ts'
import type { AbortOptions } from 'abort-error'

export interface MorticeOptions {
  /**
   * An optional name for the lock
   */
  name?: string

  /**
   * How many read operations are executed concurrently
   *
   * @default Infinity
   */
  concurrency?: number

  /**
   * By default the the lock will be held on the main thread and child/worker
   * processes will coordinate to share the lock.
   *
   * Set this to true if each main/child/worker thread should maintain it's own
   * lock with no coordination between them.
   *
   * @default false
   */
  singleProcess?: boolean

  /**
   * If true, the lock will be finalized after the last reader/writer releases
   * it.
   *
   * @default false
   */
  autoFinalize?: boolean
}

export interface Mortice {
  /**
   * Acquire a read lock. Multiple reads will occur simultaneously up to the
   * concurrency limit passed to the constructor.
   */
  readLock(options?: AbortOptions): Promise<Release>

  /**
   * Acquire a write lock. The write lock will wait for any in-flight reads to
   * complete, then prevent any further reads or writes until the lock is
   * released.
   */
  writeLock(options?: AbortOptions): Promise<Release>

  /**
   * Removes this mutex from the global state, after invoking this method it
   * cannot be used any more.
   */
  finalize(): void

  /**
   * If this is the main thread, the state of the read/write queue may be
   * inspected here
   */
  queue?: Queue
}

export interface Release {
  (): void
}

const defaultOptions = {
  name: 'lock',
  concurrency: Infinity,
  singleProcess: false,
  autoFinalize: false
}

export default function createMortice (options?: MorticeOptions): Mortice {
  const opts: Required<MorticeOptions> = Object.assign({}, defaultOptions, options)

  return createMutex(opts.name, opts)
}
