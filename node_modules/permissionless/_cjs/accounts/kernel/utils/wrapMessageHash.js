"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapMessageHash = void 0;
const viem_1 = require("viem");
const viem_2 = require("viem");
const isKernelV2_js_1 = require("./isKernelV2.js");
const wrapMessageHash = (messageHash, { accountAddress, kernelVersion, chainId }) => {
    const _domainSeparator = (0, viem_2.domainSeparator)({
        domain: {
            name: "Kernel",
            version: kernelVersion,
            chainId,
            verifyingContract: accountAddress
        }
    });
    const wrappedMessageHash = (0, isKernelV2_js_1.isKernelV2)(kernelVersion)
        ? messageHash
        : (0, viem_1.keccak256)((0, viem_1.encodeAbiParameters)([{ type: "bytes32" }, { type: "bytes32" }], [(0, viem_1.keccak256)((0, viem_1.stringToHex)("Kernel(bytes32 hash)")), messageHash]));
    const digest = (0, viem_1.keccak256)((0, viem_1.concatHex)(["0x1901", _domainSeparator, wrappedMessageHash]));
    return digest;
};
exports.wrapMessageHash = wrapMessageHash;
//# sourceMappingURL=wrapMessageHash.js.map