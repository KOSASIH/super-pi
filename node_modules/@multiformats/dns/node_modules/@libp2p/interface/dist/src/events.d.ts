import type { Uint8ArrayList } from 'uint8arraylist';
/**
 * A custom implementation of MessageEvent as the Undici version does too much
 * validation in it's constructor so is very slow.
 */
export declare class StreamMessageEvent extends Event {
    data: Uint8Array | Uint8ArrayList;
    constructor(data: Uint8Array | Uint8ArrayList, eventInitDict?: EventInit);
}
/**
 * An event dispatched when the stream is closed. The `error` property can be
 * inspected to discover if the closing was graceful or not, and the `remote`
 * property shows which end of the stream initiated the closure
 */
export declare class StreamCloseEvent extends Event {
    error?: Error;
    local?: boolean;
    constructor(local?: boolean, error?: Error, eventInitDict?: EventInit);
}
export declare class StreamAbortEvent extends StreamCloseEvent {
    constructor(error: Error, eventInitDict?: EventInit);
}
export declare class StreamResetEvent extends StreamCloseEvent {
    constructor(error: Error, eventInitDict?: EventInit);
}
//# sourceMappingURL=events.d.ts.map