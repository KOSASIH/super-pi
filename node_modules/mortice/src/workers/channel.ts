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
  WORKER_FINALIZE,
  BROADCAST_CHANNEL_NAME
} from '../constants.js'
import { nanoid } from '../utils.js'
import type { Mortice, Release } from '../index.js'
import type { AbortOptions } from 'abort-error'

export class MorticeChannelWorker implements Mortice {
  private name: string
  private channel: BroadcastChannel

  constructor (name: string) {
    this.name = name
    this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
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
    this.channel.postMessage({
      type: WORKER_FINALIZE,
      name: this.name
    })

    this.channel.close()
  }

  private async sendRequest (requestType: string, abortType: string, grantType: string, errorType: string, releaseType: string, options?: AbortOptions): Promise<Release> {
    options?.signal?.throwIfAborted()
    const id = nanoid()

    this.channel.postMessage({
      type: requestType,
      identifier: id,
      name: this.name
    })

    return new Promise<Release>((resolve, reject) => {
      const abortListener = (): void => {
        this.channel.postMessage({
          type: abortType,
          identifier: id,
          name: this.name
        })
      }

      options?.signal?.addEventListener('abort', abortListener, {
        once: true
      })

      const listener = (event: MessageEvent): void => {
        if (event.data?.identifier !== id) {
          return
        }

        if (event.data?.type === grantType) {
          this.channel.removeEventListener('message', listener)
          options?.signal?.removeEventListener('abort', abortListener)

          // lock granted
          resolve(() => {
            // release lock
            this.channel.postMessage({
              type: releaseType,
              identifier: id,
              name: this.name
            })
          })
        }

        if (event.data.type === errorType) {
          this.channel.removeEventListener('message', listener)
          options?.signal?.removeEventListener('abort', abortListener)

          // error while waiting for grant of lock
          const err = new Error()

          if (event.data.error != null) {
            err.message = event.data.error.message
            err.name = event.data.error.name
            err.stack = event.data.error.stack
          }

          reject(err)
        }
      }

      this.channel.addEventListener('message', listener)
    })
  }
}
