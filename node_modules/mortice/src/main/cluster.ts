import {
  WORKER_FINALIZE
} from '../constants.js'
import type { AbortEventData, AbortRequestType, FinalizeEventData, MorticeEvents, RequestEvent, RequestEventData, RequestType } from '../mortice.js'
import type { TypedEventTarget } from 'main-event'
import type { Worker } from 'node:cluster'

export const handleClusterWorkerLockRequest = (emitter: TypedEventTarget<MorticeEvents>, masterEvent: RequestType, abortMasterEvent: AbortRequestType, requestType: string, abortType: string, errorType: string, releaseType: string, grantType: string) => {
  return (worker: Worker, requestEvent: RequestEvent) => {
    if (requestEvent == null) {
      return
    }

    // worker is requesting lock
    if (requestEvent.type === requestType) {
      emitter.safeDispatchEvent<RequestEventData>(masterEvent, {
        detail: {
          name: requestEvent.name,
          identifier: requestEvent.identifier,
          handler: async () => {
            // grant lock to worker
            worker.send({
              type: grantType,
              name: requestEvent.name,
              identifier: requestEvent.identifier
            })

            // wait for worker to finish
            await new Promise<void>((resolve) => {
              const releaseEventListener = (releaseEvent: RequestEvent): void => {
                if (releaseEvent.type === releaseType && releaseEvent.identifier === requestEvent.identifier) {
                  worker.removeListener('message', releaseEventListener)
                  resolve()
                }
              }

              worker.on('message', releaseEventListener)
            })
          },
          onError: (err: Error) => {
            // send error to worker
            worker.send({
              type: errorType,
              name: requestEvent.name,
              identifier: requestEvent.identifier,
              error: {
                message: err.message,
                name: err.name,
                stack: err.stack
              }
            })
          }
        }
      })
    }

    // worker is no longer interested in requesting the lock
    if (requestEvent.type === abortType) {
      emitter.safeDispatchEvent<AbortEventData>(abortMasterEvent, {
        detail: {
          name: requestEvent.name,
          identifier: requestEvent.identifier
        }
      })
    }

    // worker is done with lock
    if (requestEvent.type === WORKER_FINALIZE) {
      emitter.safeDispatchEvent<FinalizeEventData>('finalizeRequest', {
        detail: {
          name: requestEvent.name
        }
      })
    }
  }
}
