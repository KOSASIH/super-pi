import { Parser } from "./parser.js";

// See https://stackoverflow.com/questions/166132/maximum-length-of-the-textual-representation-of-an-ipv6-address
const MAX_IPV6_LENGTH = 45;
const MAX_IPV4_LENGTH = 15;

const parser = new Parser();

/** Parse `input` into IPv4 bytes. */
export function parseIPv4(input: string): Uint8Array | undefined {
  if (input.length > MAX_IPV4_LENGTH) {
    return undefined;
  }
  return parser.new(input).parseWith(() => parser.readIPv4Addr());
}

/** Parse IPv4 `input` into IPv6 with IPv4-mapped bytes, eg ::ffff:1.2.3.4 */
export function parseIPv4Mapped(input: string): Uint8Array | undefined {
  if (input.length > MAX_IPV4_LENGTH) {
    return undefined;
  }

  const ipv4 = parser.new(input).parseWith(() => parser.readIPv4Addr());
  if (ipv4 === undefined) {
    return undefined;
  }

  return Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff, ipv4[0], ipv4[1], ipv4[2], ipv4[3]]);
}

/** Parse `input` into IPv6 bytes. */
export function parseIPv6(input: string): Uint8Array | undefined {
  // strip zone index if it is present
  if (input.includes("%")) {
    input = input.split("%")[0];
  }
  if (input.length > MAX_IPV6_LENGTH) {
    return undefined;
  }
  return parser.new(input).parseWith(() => parser.readIPv6Addr());
}

/** Parse `input` into IPv4 or IPv6 bytes. */
export function parseIP(input: string, mapIPv4ToIPv6 = false): Uint8Array | undefined {
  // strip zone index if it is present
  if (input.includes("%")) {
    input = input.split("%")[0];
  }

  if (input.length > MAX_IPV6_LENGTH) {
    return undefined;
  }

  const addr = parser.new(input).parseWith(() => parser.readIPAddr());
  if (!addr) {
    return undefined;
  }

  if (mapIPv4ToIPv6 && addr.length === 4) {
    return Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff, addr[0], addr[1], addr[2], addr[3]]);
  }

  return addr;
}
