"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signTypedData = signTypedData;
const viem_1 = require("viem");
const isWebAuthnAccount_js_1 = require("./isWebAuthnAccount.js");
const signMessage_js_1 = require("./signMessage.js");
const wrapMessageHash_js_1 = require("./wrapMessageHash.js");
async function signTypedData(parameters) {
    const { owner, accountAddress, kernelVersion: accountVersion, chainId, eip7702, ...typedData } = parameters;
    if ((accountVersion === "0.2.1" || accountVersion === "0.2.2") &&
        !(0, isWebAuthnAccount_js_1.isWebAuthnAccount)(owner)) {
        return owner.signTypedData({
            ...typedData
        });
    }
    const { message, primaryType, types: _types, domain } = typedData;
    const types = {
        EIP712Domain: (0, viem_1.getTypesForEIP712Domain)({
            domain: domain
        }),
        ..._types
    };
    (0, viem_1.validateTypedData)({
        domain,
        message,
        primaryType,
        types
    });
    const typedHash = (0, viem_1.hashTypedData)({ message, primaryType, types, domain });
    if (eip7702 && !(0, isWebAuthnAccount_js_1.isWebAuthnAccount)(owner)) {
        return owner.signTypedData({
            message: { hash: typedHash },
            primaryType: "Kernel",
            types: {
                Kernel: [{ name: "hash", type: "bytes32" }]
            },
            domain: {
                name: "Kernel",
                version: accountVersion,
                chainId: chainId,
                verifyingContract: accountAddress
            }
        });
    }
    const wrappedMessageHash = (0, wrapMessageHash_js_1.wrapMessageHash)(typedHash, {
        kernelVersion: accountVersion,
        accountAddress,
        chainId: chainId
    });
    if ((0, isWebAuthnAccount_js_1.isWebAuthnAccount)(owner)) {
        return (0, signMessage_js_1.signMessage)({
            message: { raw: wrappedMessageHash },
            owner,
            accountAddress,
            kernelVersion: accountVersion,
            chainId,
            eip7702: false
        });
    }
    return owner.signMessage({
        message: { raw: wrappedMessageHash }
    });
}
//# sourceMappingURL=signTypedData.js.map