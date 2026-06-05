/**
 * A custom implementation of MessageEvent as the Undici version does too much
 * validation in it's constructor so is very slow.
 */
export class StreamMessageEvent extends Event {
    data;
    constructor(data, eventInitDict) {
        super('message', eventInitDict);
        this.data = data;
    }
}
/**
 * An event dispatched when the stream is closed. The `error` property can be
 * inspected to discover if the closing was graceful or not, and the `remote`
 * property shows which end of the stream initiated the closure
 */
export class StreamCloseEvent extends Event {
    error;
    local;
    constructor(local, error, eventInitDict) {
        super('close', eventInitDict);
        this.error = error;
        this.local = local;
    }
}
export class StreamAbortEvent extends StreamCloseEvent {
    constructor(error, eventInitDict) {
        super(true, error, eventInitDict);
    }
}
export class StreamResetEvent extends StreamCloseEvent {
    constructor(error, eventInitDict) {
        super(false, error, eventInitDict);
    }
}
//# sourceMappingURL=events.js.map