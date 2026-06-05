import {
  WORKER_FINALIZE
} from '../constants.js'
import type { AbortEventData, AbortRequestType, FinalizeEventData, MorticeEvents, RequestType } from '../mortice.js'
import type { TypedEventTarget } from 'main-event'

export const handleChannelWorkerLockRequest = (emitter: TypedEventTarget<MorticeEvents>, channel: BroadcastChannel, masterEvent: RequestType, abortMasterEvent: AbortRequestType, requestType: string, abortType: string, errorType: string, releaseType: string, grantType: string) => {
  return (event: MessageEvent) => {
    if (event.data == null) {
      return
    }

    const requestEvent = {
      type: event.data.type,
      name: event.data.name,
      identifier: event.data.identifier
    }

    // worker is requesting lock
    if (requestEvent.type === requestType) {
      emitter.safeDispatchEvent(masterEvent, {
        detail: {
          name: requestEvent.name,
          identifier: requestEvent.identifier,
          handler: async (): Promise<void> => {
            // grant lock to worker
            channel.postMessage({
              type: grantType,
              name: requestEvent.name,
              identifier: requestEvent.identifier
            })

            // wait for worker to finish
            await new Promise<void>((resolve) => {
              const releaseEventListener = (event: MessageEvent): void => {
                if (event?.data == null) {
                  return
                }

                const releaseEvent = {
                  type: event.data.type,
                  name: event.data.name,
                  identifier: event.data.identifier
                }

                if (releaseEvent.type === releaseType && releaseEvent.identifier === requestEvent.identifier) {
                  channel.removeEventListener('message', releaseEventListener)
                  resolve()
                }
              }

              channel.addEventListener('message', releaseEventListener)
            })
          },
          onError: (err: Error) => {
            // send error to worker
            channel.postMessage({
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
