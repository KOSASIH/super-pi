import { toHex } from "viem";
export function encodeNonce(args) {
    const key = BigInt(toHex(args.key, { size: 24 }));
    const sequence = BigInt(toHex(args.sequence, { size: 8 }));
    return (key << BigInt(64)) + sequence;
}
//# sourceMappingURL=encodeNonce.js.map