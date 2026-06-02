"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRegistration = void 0;
const ox_1 = require("ox");
const verifyRegistration = async (client, args) => {
    const { credential, context } = args;
    const response = credential.raw
        .response;
    let responsePublicKeyAlgorithm = undefined;
    if (typeof response.getPublicKeyAlgorithm === "function") {
        try {
            responsePublicKeyAlgorithm = response.getPublicKeyAlgorithm();
        }
        catch (error) {
            throw new Error("getPublicKeyAlgorithm() is not supported");
        }
    }
    let responseAuthenticatorData;
    if (typeof response.getAuthenticatorData === "function") {
        try {
            responseAuthenticatorData = ox_1.Base64.fromBytes(new Uint8Array(response.getAuthenticatorData()));
        }
        catch (error) {
            throw new Error("getAuthenticatorData() is not supported");
        }
    }
    const serverResponse = await client.request({
        method: "pks_verifyRegistration",
        params: [
            {
                id: credential.id,
                rawId: ox_1.Base64.fromBytes(new Uint8Array(credential.raw.rawId), {
                    pad: false,
                    url: true
                }),
                response: {
                    clientDataJSON: ox_1.Base64.fromBytes(new Uint8Array(response.clientDataJSON)),
                    attestationObject: ox_1.Base64.fromBytes(new Uint8Array(response.attestationObject), {
                        url: true
                    }),
                    transports: typeof response.getTransports === "function"
                        ? response.getTransports()
                        : undefined,
                    publicKeyAlgorithm: responsePublicKeyAlgorithm,
                    authenticatorData: responseAuthenticatorData
                },
                authenticatorAttachment: credential.raw
                    .authenticatorAttachment,
                clientExtensionResults: credential.raw.getClientExtensionResults(),
                type: credential.raw.type
            },
            context
        ]
    }, {
        retryCount: 0
    });
    const success = Boolean(serverResponse?.success);
    const id = serverResponse?.id;
    const publicKey = serverResponse?.publicKey;
    const userName = serverResponse?.userName;
    if (typeof id !== "string") {
        throw new Error("Invalid passkey id returned from server");
    }
    if (typeof publicKey !== "string" || !publicKey.startsWith("0x")) {
        throw new Error("Invalid public key returned from server - must be hex string starting with 0x");
    }
    if (typeof userName !== "string") {
        throw new Error("Invalid user name returned from server");
    }
    return {
        success,
        id,
        publicKey: publicKey,
        userName
    };
};
exports.verifyRegistration = verifyRegistration;
//# sourceMappingURL=verifyRegistration.js.map