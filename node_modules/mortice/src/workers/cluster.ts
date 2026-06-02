import {
  WORKER_REQUEST_READ_LOCK,
  WORKER_RELEASE_READ_LOCK,
  MASTER_GRANT_READ_LOCK,
  WORKER_REQUEST_WRITE_LOCK,
  WORKER_RELEASE_WRITE_LOCK,
  MASTER_GRANT_WRITE_LOCK,
  WORKER_ABORT_READ_LOCK_REQUEST,
  WORKER_ABORT_WRITE_LOCK_REQUEST,
  MASTER_READ_LOCK_ERROR,
  MASTER_WRITE_LOCK_ERROR,
  WORKER_FINALIZE
} from '../constants.js'
import { nanoid } from '../utils.js'
import type { Mortice, Release } from '../index.js'
import type { RequestEvent } from '../mortice.ts'
import type { AbortOptions } from 'abort-error'

export class MorticeClusterWorker implements Mortice {
  private name: string

  constructor (name: string) {
    this.name = name
  }

  readLock (options?: AbortOptions): Promise<Release> {
    return this.sendRequest(
      WORKER_REQUEST_READ_LOCK,
      WORKER_ABORT_READ_LOCK_REQUEST,
      MASTER_GRANT_READ_LOCK,
      MASTER_READ_LOCK_ERROR,
      WORKER_RELEASE_READ_LOCK,
      options
    )
  }

  writeLock (options?: AbortOptions): Promise<Release> {
    return this.sendRequest(
      WORKER_REQUEST_WRITE_LOCK,
      WORKER_ABORT_WRITE_LOCK_REQUEST,
      MASTER_GRANT_WRITE_LOCK,
      MASTER_WRITE_LOCK_ERROR,
      WORKER_RELEASE_WRITE_LOCK,
      options
    )
  }

  finalize (): void {
    if (process.send == null) {
      throw new Error('No send method on process - are we a cluster worker?')
    }

    process.send({
      type: WORKER_FINALIZE,
      identifier: nanoid(),
      name: this.name
    })
  }

  private async sendRequest (requestType: string, abortType: string, grantType: string, errorType: string, releaseType: string, options?: AbortOptions): Promise<Release> {
    options?.signal?.throwIfAborted()

    const id = nanoid()

    if (process.send == null) {
      throw new Error('No send method on process - are we a cluster worker?')
    }

    process.send({
      type: requestType,
      identifier: id,
      name: this.name
    })

    return new Promise<Release>((resolve, reject) => {
      const abortListener = (): void => {
        process.send?.({
          type: abortType,
          identifier: id,
          name: this.name
        })
      }

      options?.signal?.addEventListener('abort', abortListener, {
        once: true
      })

      const listener = (event: RequestEvent): void => {
        if (event.identifier !== id) {
          return
        }

        if (event.type === grantType) {
          process.removeListener('message', listener)
          options?.signal?.removeEventListener('abort', abortListener)

          // lock granted
          resolve(() => {
            // release lock
            process.send?.({
              type: releaseType,
              identifier: id,
              name: this.name
            })
          })
        }

        if (event.type === errorType) {
          process.removeListener('message', listener)
          options?.signal?.removeEventListener('abort', abortListener)

          // error while waiting for grant of lock
          const err = new Error()

          if (event.error != null) {
            err.message = event.error.message
            err.name = event.error.name
            err.stack = event.error.stack
          }

          reject(err)
        }
      }

      process.on('message', listener)
    })
  }
}
