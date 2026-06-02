import { TypedEventEmitter } from 'main-event'
import type { Mortice, MorticeOptions } from './index.js'
import type { MorticeEvents } from './mortice.js'
import type { TypedEventTarget } from 'main-event'

export default (options: Required<MorticeOptions>): Mortice | TypedEventTarget<MorticeEvents> => {
  // react-native is single-process only
  return new TypedEventEmitter()
}
