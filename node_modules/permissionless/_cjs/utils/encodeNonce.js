"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeNonce = encodeNonce;
const viem_1 = require("viem");
function encodeNonce(args) {
    const key = BigInt((0, viem_1.toHex)(args.key, { size: 24 }));
    const sequence = BigInt((0, viem_1.toHex)(args.sequence, { size: 8 }));
    return (key << BigInt(64)) + sequence;
}
//# sourceMappingURL=encodeNonce.js.map