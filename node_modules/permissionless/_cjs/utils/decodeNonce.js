"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeNonce = decodeNonce;
const viem_1 = require("viem");
function decodeNonce(nonce) {
    const parsedNonce = BigInt((0, viem_1.toHex)(nonce, { size: 32 }));
    const key = parsedNonce >> BigInt(64);
    const sequence = parsedNonce & BigInt("0xFFFFFFFFFFFFFFFF");
    return { key, sequence };
}
//# sourceMappingURL=decodeNonce.js.map