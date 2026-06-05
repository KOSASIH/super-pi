import { AbortError } from 'abort-error'
import { Queue } from 'it-queue'
import impl from './node.js'
import type { Mortice, MorticeOptions, Release } from './index.js'
import type { AbortOptions } from 'abort-error'
import type { TypedEventTarget } from 'main-event'

export type RequestType = 'requestReadLock' | 'requestWriteLock'
export type AbortRequestType = 'abortReadLockRequest' | 'abortWriteLockRequest'
export type FinalizeRequestType = 'finalizeRequest'

export interface RequestEventData {
  name: string
  identifier: string
  handler(): Promise<void>
  onError(err: Error): void
}

export interface RequestEvent {
  type: string
  identifier: string
  name: string,
  error?: {
    name: string
    message: string
    stack: string
  }
}

export interface AbortEventData {
  name: string
  identifier: string
}

export interface FinalizeEventData {
  name: string
}

export interface MorticeEvents {
  requestReadLock: CustomEvent<RequestEventData>
  abortReadLockRequest: CustomEvent<AbortEventData>
  requestWriteLock: CustomEvent<RequestEventData>
  abortWriteLockRequest: CustomEvent<AbortEventData>
  finalizeRequest: CustomEvent<FinalizeEventData>
}

const mutexes: Map<string, Mortice> = new Map()
let implementation: Mortice | TypedEventTarget<MorticeEvents>

export function isMortice (obj?: any): obj is Mortice {
  return typeof obj?.readLock === 'function' && typeof obj?.writeLock === 'function'
}

export function getImplementation (opts: Required<MorticeOptions>): Mortice | TypedEventTarget<MorticeEvents> {
  if (implementation == null) {
    implementation = impl(opts)

    if (!isMortice(implementation)) {
      const emitter = implementation

      // we are master, set up worker requests
      emitter.addEventListener('requestReadLock', (event: CustomEvent<RequestEventData>) => {
        const mutexName = event.detail.name
        const identifier = event.detail.identifier
        const mutex = mutexes.get(mutexName)

        if (mutex == null) {
          return
        }

        const abortController = new AbortController()

        const abortListener = (event: CustomEvent<AbortEventData>): void => {
          if (event.detail.name !== mutexName || event.detail.identifier !== identifier) {
            return
          }

          abortController.abort()
        }

        emitter.addEventListener('abortReadLockRequest', abortListener)

        void mutex.readLock({
          signal: abortController.signal
        })
          .then(async release => {
            await event.detail.handler()
              .finally(() => {
                release()
              })
          })
          .catch(err => {
            event.detail.onError(err)
          })
          .finally(() => {
            emitter.removeEventListener('abortReadLockRequest', abortListener)
          })
      })

      emitter.addEventListener('requestWriteLock', (event: CustomEvent<RequestEventData>) => {
        const mutexName = event.detail.name
        const identifier = event.detail.identifier
        const mutex = mutexes.get(mutexName)

        if (mutex == null) {
          return
        }

        const abortController = new AbortController()

        const abortListener = (event: CustomEvent<AbortEventData>): void => {
          if (event.detail.name !== mutexName || event.detail.identifier !== identifier) {
            return
          }

          abortController.abort()
        }

        emitter.addEventListener('abortWriteLockRequest', abortListener)

        void mutex.writeLock({
          signal: abortController.signal
        })
          .then(async release => {
            await event.detail.handler()
              .finally(() => {
                release()
              })
          })
          .catch(err => {
            event.detail.onError(err)
          })
          .finally(() => {
            emitter.removeEventListener('abortWriteLockRequest', abortListener)
          })
      })

      emitter.addEventListener('finalizeRequest', (event: CustomEvent<FinalizeEventData>): void => {
        const mutexName = event.detail.name
        const mutex = mutexes.get(mutexName)

        if (mutex == null) {
          return
        }

        mutex.finalize()
      })
    }
  }

  return implementation
}

async function createReleasable (queue: Queue, options?: AbortOptions): Promise<Release> {
  let res: (release: Release) => void
  let rej: (err: Error) => void

  const p = new Promise<Release>((resolve, reject) => {
    res = resolve
    rej = reject
  })

  const listener = (): void => {
    rej(new AbortError())
  }

  options?.signal?.addEventListener('abort', listener, {
    once: true
  })

  queue.add(async () => {
    await new Promise<void>((resolve) => {
      res(() => {
        options?.signal?.removeEventListener('abort', listener)
        resolve()
      })
    })
  }, {
    signal: options?.signal
  })
    .catch((err) => {
      rej(err)
    })

  return p
}

export const createMutex = (name: string, options: Required<MorticeOptions>): Mortice => {
  let mutex = mutexes.get(name)

  if (mutex != null) {
    return mutex
  }

  const implementation = getImplementation(options)

  // a Mortice instance will be returned if we are a worker, otherwise if we are
  // primary an event target will be returned that fires events when workers
  // request a lock
  if (isMortice(implementation)) {
    mutex = implementation

    mutexes.set(name, mutex)

    return mutex
  }

  const masterQueue = new Queue({
    concurrency: 1
  })
  let readQueue: Queue | null

  mutex = {
    async readLock (opts?: AbortOptions) {
      // If there's already a read queue, just add the task to it
      if (readQueue != null) {
        return createReleasable(readQueue, opts)
      }

      // Create a new read queue
      readQueue = new Queue({
        concurrency: options.concurrency,
        autoStart: false
      })
      const localReadQueue = readQueue

      // Add the task to the read queue
      const readPromise = createReleasable(readQueue, opts)

      void masterQueue.add(async () => {
        // Start the task only once the master queue has completed processing
        // any previous tasks
        localReadQueue.start()

        // Once all the tasks in the read queue have completed, remove it so
        // that the next read lock will occur after any write locks that were
        // started in the interim
        await localReadQueue.onIdle()
          .then(() => {
            if (readQueue === localReadQueue) {
              readQueue = null
            }
          })
      })

      return readPromise
    },
    async writeLock (opts?: AbortOptions) {
      // Remove the read queue reference, so that any later read locks will be
      // added to a new queue that starts after this write lock has been
      // released
      readQueue = null

      return createReleasable(masterQueue, opts)
    },
    finalize: () => {
      mutexes.delete(name)
    },
    queue: masterQueue
  }

  mutexes.set(name, mutex)

  // if requested, finalize the lock once the last lock holder has released it
  if (options.autoFinalize === true) {
    masterQueue.addEventListener('idle', () => {
      mutex.finalize()
    }, {
      once: true
    })
  }

  return mutex
}
