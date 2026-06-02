/**
 * When this error is thrown it means an operation was aborted,
 * usually in response to the `abort` event being emitted by an
 * AbortSignal.
 */
export declare class AbortError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a remote Peer ID does not match the expected one
 */
export declare class UnexpectedPeerError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a crypto exchange fails
 */
export declare class InvalidCryptoExchangeError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when invalid parameters are passed to a function or method call
 */
export declare class InvalidParametersError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a public key is invalid
 */
export declare class InvalidPublicKeyError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a private key is invalid
 */
export declare class InvalidPrivateKeyError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a operation is unsupported
 */
export declare class UnsupportedOperationError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a connection is closing
 */
export declare class ConnectionClosingError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a connection is closed
 */
export declare class ConnectionClosedError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a connection fails
 */
export declare class ConnectionFailedError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when the muxer is closed and an attempt to open a stream occurs
 */
export declare class MuxerClosedError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a protocol stream is reset by the remote muxer
 */
export declare class StreamResetError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a protocol stream is aborted locally
 */
export declare class StreamAbortedError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a stream is in an invalid state
 */
export declare class StreamStateError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a stream buffer is full
 */
export declare class StreamBufferError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a value could not be found
 */
export declare class NotFoundError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when an invalid peer ID is encountered
 */
export declare class InvalidPeerIdError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when an invalid multiaddr is encountered
 */
export declare class InvalidMultiaddrError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when an invalid CID is encountered
 */
export declare class InvalidCIDError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when an invalid multihash is encountered
 */
export declare class InvalidMultihashError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a protocol is not supported
 */
export declare class UnsupportedProtocolError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * An invalid or malformed message was encountered during a protocol exchange
 */
export declare class InvalidMessageError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a remote peer sends a structurally valid message that does not
 * comply with the protocol
 */
export declare class ProtocolError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Throw when an operation times out
 */
export declare class TimeoutError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a startable component is interacted with but it has not been
 * started yet
 */
export declare class NotStartedError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when a component is started that has already been started
 */
export declare class AlreadyStartedError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when dialing an address failed
 */
export declare class DialError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when listening on an address failed
 */
export declare class ListenError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * This error is thrown when a limited connection is encountered, i.e. if the
 * user tried to open a stream on a connection for a protocol that is not
 * configured to run over limited connections.
 */
export declare class LimitedConnectionError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * This error is thrown where there are too many inbound protocols streams open
 */
export declare class TooManyInboundProtocolStreamsError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * This error is thrown where there are too many outbound protocols streams open
 */
export declare class TooManyOutboundProtocolStreamsError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when an attempt to operate on an unsupported key was made
 */
export declare class UnsupportedKeyTypeError extends Error {
    static name: string;
    constructor(message?: string);
}
/**
 * Thrown when an operation has not been implemented
 */
export declare class NotImplementedError extends Error {
    static name: string;
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map