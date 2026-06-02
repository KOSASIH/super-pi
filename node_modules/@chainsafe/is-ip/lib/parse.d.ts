/** Parse `input` into IPv4 bytes. */
export declare function parseIPv4(input: string): Uint8Array | undefined;
/** Parse IPv4 `input` into IPv6 with IPv4-mapped bytes, eg ::ffff:1.2.3.4 */
export declare function parseIPv4Mapped(input: string): Uint8Array | undefined;
/** Parse `input` into IPv6 bytes. */
export declare function parseIPv6(input: string): Uint8Array | undefined;
/** Parse `input` into IPv4 or IPv6 bytes. */
export declare function parseIP(input: string, mapIPv4ToIPv6?: boolean): Uint8Array | undefined;
//# sourceMappingURL=parse.d.ts.map