import cluster from 'node:cluster'
import worker from 'node:worker_threads'
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
import { handleClusterWorkerLockRequest } from './main/cluster.ts'
import { MorticeChannelWorker } from './workers/channel.ts'
import { MorticeClusterWorker } from './workers/cluster.ts'
import type { Mortice, MorticeOptions } from './index.js'
import type { MorticeEvents } from './mortice.js'
import type { TypedEventTarget } from 'main-event'

function isMain (): boolean {
  if (worker.isMainThread === false) {
    return false
  }

  if (worker.isInternalThread === true) {
    return false
  }

  return cluster.isPrimary
}

export default (options: Required<MorticeOptions>): Mortice | TypedEventTarget<MorticeEvents> => {
  options = Object.assign({}, defaultOptions, options)

  if (isMain() || options.singleProcess) {
    const emitter = new TypedEventEmitter()

    cluster.on('message', handleClusterWorkerLockRequest(
      emitter,
      'requestReadLock',
      'abortReadLockRequest',
      WORKER_REQUEST_READ_LOCK,
      WORKER_ABORT_READ_LOCK_REQUEST,
      MASTER_READ_LOCK_ERROR,
      WORKER_RELEASE_READ_LOCK,
      MASTER_GRANT_READ_LOCK
    ))
    cluster.on('message', handleClusterWorkerLockRequest(
      emitter,
      'requestWriteLock',
      'abortWriteLockRequest',
      WORKER_REQUEST_WRITE_LOCK,
      WORKER_ABORT_WRITE_LOCK_REQUEST,
      MASTER_WRITE_LOCK_ERROR,
      WORKER_RELEASE_WRITE_LOCK,
      MASTER_GRANT_WRITE_LOCK
    ))

    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
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

    // @ts-expect-error not in types
    channel.unref?.()

    return emitter
  }

  if (cluster.isWorker) {
    return new MorticeClusterWorker(options.name)
  }

  if (worker.isMainThread === false) {
    return new MorticeChannelWorker(options.name)
  }

  throw new Error('Not a cluster worker or worker thread')
}
