import { concatHex, encodeAbiParameters, keccak256, stringToHex } from "viem";
import { domainSeparator } from "viem";
import { isKernelV2 } from "./isKernelV2.js";
export const wrapMessageHash = (messageHash, { accountAddress, kernelVersion, chainId }) => {
    const _domainSeparator = domainSeparator({
        domain: {
            name: "Kernel",
            version: kernelVersion,
            chainId,
            verifyingContract: accountAddress
        }
    });
    const wrappedMessageHash = isKernelV2(kernelVersion)
        ? messageHash
        : keccak256(encodeAbiParameters([{ type: "bytes32" }, { type: "bytes32" }], [keccak256(stringToHex("Kernel(bytes32 hash)")), messageHash]));
    const digest = keccak256(concatHex(["0x1901", _domainSeparator, wrappedMessageHash]));
    return digest;
};
//# sourceMappingURL=wrapMessageHash.js.map