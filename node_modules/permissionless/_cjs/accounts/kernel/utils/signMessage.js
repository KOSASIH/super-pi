"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signMessage = signMessage;
const ox_1 = require("ox");
const viem_1 = require("viem");
const isWebAuthnAccount_js_1 = require("./isWebAuthnAccount.js");
const wrapMessageHash_js_1 = require("./wrapMessageHash.js");
async function signMessage({ message, owner, accountAddress, kernelVersion: accountVersion, chainId, eip7702 }) {
    if ((0, isWebAuthnAccount_js_1.isWebAuthnAccount)(owner)) {
        let messageContent;
        if (typeof message === "string") {
            messageContent = (0, wrapMessageHash_js_1.wrapMessageHash)((0, viem_1.hashMessage)(message), {
                kernelVersion: accountVersion,
                accountAddress,
                chainId
            });
        }
        else if ("raw" in message && typeof message.raw === "string") {
            messageContent = message.raw;
        }
        else if ("raw" in message && message.raw instanceof Uint8Array) {
            messageContent = message.raw.toString();
        }
        else {
            throw new Error("Unsupported message format");
        }
        const { signature: signatureData, webauthn } = await owner.sign({
            hash: messageContent
        });
        const signature = ox_1.Signature.fromHex(signatureData);
        const encodedSignature = (0, viem_1.encodeAbiParameters)([
            { name: "authenticatorData", type: "bytes" },
            { name: "clientDataJSON", type: "string" },
            { name: "responseTypeLocation", type: "uint256" },
            { name: "r", type: "uint256" },
            { name: "s", type: "uint256" },
            { name: "usePrecompiled", type: "bool" }
        ], [
            webauthn.authenticatorData,
            webauthn.clientDataJSON,
            BigInt(webauthn.typeIndex),
            BigInt(signature.r),
            BigInt(signature.s),
            false
        ]);
        return encodedSignature;
    }
    if (eip7702) {
        return owner.signTypedData({
            message: { hash: (0, viem_1.hashMessage)(message) },
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
    if (accountVersion === "0.2.1" || accountVersion === "0.2.2") {
        return owner.signMessage({
            message
        });
    }
    const wrappedMessageHash = (0, wrapMessageHash_js_1.wrapMessageHash)((0, viem_1.hashMessage)(message), {
        kernelVersion: accountVersion,
        accountAddress,
        chainId
    });
    return owner.signMessage({
        message: { raw: wrappedMessageHash }
    });
}
//# sourceMappingURL=signMessage.js.map