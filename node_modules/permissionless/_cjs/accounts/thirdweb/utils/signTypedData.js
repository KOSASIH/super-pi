"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signTypedData = signTypedData;
const viem_1 = require("viem");
async function signTypedData(parameters) {
    const { admin, accountAddress, chainId, ...typedData } = parameters;
    const isSelfVerifyingContract = typedData.domain?.verifyingContract?.toLowerCase() === accountAddress;
    if (isSelfVerifyingContract) {
        return admin.signTypedData({
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
    const wrappedMessageHash = (0, viem_1.encodeAbiParameters)([{ type: "bytes32" }], [typedHash]);
    return admin.signTypedData({
        domain: {
            name: "Account",
            version: "1",
            chainId,
            verifyingContract: accountAddress
        },
        primaryType: "AccountMessage",
        types: { AccountMessage: [{ name: "message", type: "bytes" }] },
        message: { message: wrappedMessageHash }
    });
}
//# sourceMappingURL=signTypedData.js.map