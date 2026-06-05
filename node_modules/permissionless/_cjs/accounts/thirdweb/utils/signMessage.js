"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signMessage = signMessage;
const viem_1 = require("viem");
async function signMessage({ message, admin, accountAddress, chainId }) {
    const hashedMessage = (0, viem_1.hashMessage)(message);
    return admin.signTypedData({
        domain: {
            name: "Account",
            version: "1",
            chainId,
            verifyingContract: accountAddress
        },
        primaryType: "AccountMessage",
        types: { AccountMessage: [{ name: "message", type: "bytes" }] },
        message: { message: hashedMessage }
    });
}
//# sourceMappingURL=signMessage.js.map