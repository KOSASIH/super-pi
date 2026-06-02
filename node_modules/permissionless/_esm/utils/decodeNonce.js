import { toHex } from "viem";
export function decodeNonce(nonce) {
    const parsedNonce = BigInt(toHex(nonce, { size: 32 }));
    const key = parsedNonce >> BigInt(64);
    const sequence = parsedNonce & BigInt("0xFFFFFFFFFFFFFFFF");
    return { key, sequence };
}
//# sourceMappingURL=decodeNonce.js.map