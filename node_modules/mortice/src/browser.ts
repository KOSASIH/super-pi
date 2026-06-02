import { TypedEventEmitter } from 'main-event'
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
  BROADCAST_CHANNEL_NAME,
  defaultOptions
} from './constants.js'
import { handleChannelWorkerLockRequest } from './main/channel.ts'
import { MorticeChannelWorker } from './workers/channel.ts'
import type { Mortice, MorticeOptions } from './index.js'
import type { MorticeEvents } from './mortice.js'
import type { TypedEventTarget } from 'main-event'

export default (options: Required<MorticeOptions>): Mortice | TypedEventTarget<MorticeEvents> => {
  options = Object.assign({}, defaultOptions, options)
  const isPrimary = Boolean(globalThis.document) || options.singleProcess

  if (isPrimary) {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
    const emitter = new TypedEventEmitter<MorticeEvents>()

    channel.addEventListener('message', handleChannelWorkerLockRequest(
      emitter,
      channel,
      'requestReadLock',
      'abortReadLockRequest',
      WORKER_REQUEST_READ_LOCK,
      WORKER_ABORT_READ_LOCK_REQUEST,
      MASTER_READ_LOCK_ERROR,
      WORKER_RELEASE_READ_LOCK,
      MASTER_GRANT_READ_LOCK
    ))
    channel.addEventListener('message', handleChannelWorkerLockRequest(
      emitter,
      channel,
      'requestWriteLock',
      'abortWriteLockRequest',
      WORKER_REQUEST_WRITE_LOCK,
      WORKER_ABORT_WRITE_LOCK_REQUEST,
      MASTER_WRITE_LOCK_ERROR,
      WORKER_RELEASE_WRITE_LOCK,
      MASTER_GRANT_WRITE_LOCK
    ))

    return emitter
  }

  return new MorticeChannelWorker(options.name)
}
