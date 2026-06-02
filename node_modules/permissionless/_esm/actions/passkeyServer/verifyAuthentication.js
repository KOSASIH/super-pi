import { Base64 } from "ox";
export const verifyAuthentication = async (client, args) => {
    const { raw, uuid } = args;
    let responseAuthenticatorData;
    if ("authenticatorData" in raw.response) {
        responseAuthenticatorData = Base64.fromBytes(new Uint8Array(raw.response.authenticatorData), {
            url: true
        });
    }
    else {
        throw new Error("authenticatorData not found in the signature");
    }
    let signature;
    if ("signature" in raw.response) {
        signature = Base64.fromBytes(new Uint8Array(raw.response.signature), {
            pad: false,
            url: true
        });
    }
    else {
        throw new Error("signature not found in the signature");
    }
    let userHandle;
    if ("userHandle" in raw.response) {
        userHandle = Base64.fromBytes(new Uint8Array(raw.response.userHandle), {
            pad: false,
            url: true
        });
    }
    const serverResponse = await client.request({
        method: "pks_verifyAuthentication",
        params: [
            {
                id: raw.id,
                rawId: Base64.fromBytes(new Uint8Array(raw.rawId), {
                    pad: false,
                    url: true
                }),
                authenticatorAttachment: raw.authenticatorAttachment,
                response: {
                    clientDataJSON: Base64.fromBytes(new Uint8Array(raw.response.clientDataJSON), {
                        pad: false,
                        url: true
                    }),
                    authenticatorData: responseAuthenticatorData,
                    signature,
                    userHandle
                },
                clientExtensionResults: raw.getClientExtensionResults(),
                type: raw.type
            },
            {
                uuid
            }
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
//# sourceMappingURL=verifyAuthentication.js.map