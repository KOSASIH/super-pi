/**
 * An implementation of the ProgressEvent interface, this is essentially
 * a typed `CustomEvent` with a `type` property that lets us disambiguate
 * events passed to `progress` callbacks.
 */
export class CustomProgressEvent extends Event {
    type;
    detail;
    constructor(type, detail) {
        super(type);
        this.type = type;
        // @ts-expect-error detail may be undefined
        this.detail = detail;
    }
}
//# sourceMappingURL=index.js.map