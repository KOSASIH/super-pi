/**
 * @packageDocumentation
 *
 * Adds types to the EventTarget class.
 *
 * Hopefully this won't be necessary
 * forever:
 *
 * - https://github.com/microsoft/TypeScript/issues/28357
 * - https://github.com/microsoft/TypeScript/issues/43477
 * - https://github.com/microsoft/TypeScript/issues/299
 * - https://www.npmjs.com/package/typed-events
 * - https://www.npmjs.com/package/typed-event-emitter
 * - https://www.npmjs.com/package/typed-event-target
 * - etc
 *
 * In addition to types, a `safeDispatchEvent` method is available which
 * prevents dispatching events that aren't in the event map, and a
 * `listenerCount` method which reports the number of listeners that are
 * currently registered for a given event.
 *
 * @example
 *
 * ```ts
 * import { TypedEventEmitter } from 'main-event'
 * import type { TypedEventTarget } from 'main-event'
 *
 * interface EventTypes {
 *   'test': CustomEvent<string>
 * }
 *
 * const target = new TypedEventEmitter<EventTypes>()
 *
 * // it's a regular EventTarget
 * console.info(target instanceof EventTarget) // true
 *
 * // register listeners normally
 * target.addEventListener('test', (evt) => {
 *   // evt is CustomEvent<string>
 * })
 *
 * // @ts-expect-error 'derp' is not in the event map
 * target.addEventListener('derp', () => {})
 *
 * // use normal dispatchEvent method
 * target.dispatchEvent(new CustomEvent('test', {
 *   detail: 'hello'
 * }))
 *
 * // use type safe dispatch method
 * target.safeDispatchEvent('test', {
 *   detail: 'world'
 * })
 *
 * // report listener count
 * console.info(target.listenerCount('test')) // 0
 *
 * // event emitters can be used purely as interfaces too
 * function acceptTarget (target: TypedEventTarget<EventTypes>) {
 *   // ...
 * }
 * ```
 */

import { setMaxListeners } from './events.ts'

export interface EventCallback<EventType> { (evt: EventType): void }
export interface EventObject<EventType> { handleEvent: EventCallback<EventType> }
export type EventHandler<EventType> = EventCallback<EventType> | EventObject<EventType>

interface Listener {
  once: boolean
  callback: any
}

/**
 *
 */
export interface TypedEventTarget <EventMap extends Record<string, any>> extends EventTarget {
  addEventListener<K extends keyof EventMap>(type: K, listener: EventHandler<EventMap[K]> | null, options?: boolean | AddEventListenerOptions): void

  listenerCount (type: string): number

  removeEventListener<K extends keyof EventMap>(type: K, listener?: EventHandler<EventMap[K]> | null, options?: boolean | EventListenerOptions): void

  removeEventListener (type: string, listener?: EventHandler<Event>, options?: boolean | EventListenerOptions): void

  safeDispatchEvent<Detail>(type: keyof EventMap, detail?: CustomEventInit<Detail>): boolean
}

function isEventObject <EventType> (obj?: any): obj is EventObject<EventType> {
  return typeof obj?.handleEvent === 'function'
}

function isOnce (options?: boolean | AddEventListenerOptions): boolean {
  return (options !== true && options !== false && options?.once) ?? false
}

/**
 * An implementation of a typed event target
 */
export class TypedEventEmitter<EventMap extends Record<string, any>> extends EventTarget implements TypedEventTarget<EventMap> {
  readonly #listeners = new Map<any, Listener[]>()

  constructor () {
    super()

    // silence MaxListenersExceededWarning warning on Node.js, this is a red
    // herring almost all of the time
    setMaxListeners(Infinity, this)
  }

  listenerCount (type: string): number {
    const listeners = this.#listeners.get(type)

    if (listeners == null) {
      return 0
    }

    return listeners.length
  }

  addEventListener<K extends keyof EventMap>(type: K, listener: EventHandler<EventMap[K]> | null, options?: boolean | AddEventListenerOptions): void
  addEventListener (type: string, listener: EventHandler<Event>, options?: boolean | AddEventListenerOptions): void {
    const once = isOnce(options)

    super.addEventListener(type, (evt) => {
      if (once) {
        let list = this.#listeners.get(evt.type)

        if (list != null) {
          list = list.filter(({ callback }) => callback !== listener)
          this.#listeners.set(evt.type, list)
        }
      }

      if (isEventObject<Event>(listener)) {
        listener.handleEvent(evt)
      } else {
        listener(evt)
      }
    }, options)

    let list = this.#listeners.get(type)

    if (list == null) {
      list = []
      this.#listeners.set(type, list)
    }

    list.push({
      callback: listener,
      once
    })
  }

  removeEventListener<K extends keyof EventMap>(type: K, listener?: EventHandler<EventMap[K]> | null, options?: boolean | EventListenerOptions): void
  removeEventListener (type: string, listener?: EventHandler<Event>, options?: boolean | EventListenerOptions): void {
    super.removeEventListener(type.toString(), listener ?? null, options)

    let list = this.#listeners.get(type)

    if (list == null) {
      return
    }

    list = list.filter(({ callback }) => callback !== listener)
    this.#listeners.set(type, list)
  }

  safeDispatchEvent<Detail>(type: keyof EventMap, detail: CustomEventInit<Detail> = {}): boolean {
    return this.dispatchEvent(new CustomEvent<Detail>(type as string, detail))
  }
}

export { setMaxListeners }
