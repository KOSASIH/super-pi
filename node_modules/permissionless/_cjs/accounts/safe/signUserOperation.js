"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebAuthnSignature = exports.concatSignatures = void 0;
exports.signUserOperation = signUserOperation;
const ox_1 = require("ox");
const viem_1 = require("viem");
const index_js_1 = require("../../utils/index.js");
const toSafeSmartAccount_js_1 = require("./toSafeSmartAccount.js");
const concatSignatures = (signatures) => {
    signatures.sort((left, right) => left.signer.toLowerCase().localeCompare(right.signer.toLowerCase()));
    const SIGNATURE_LENGTH_BYTES = 65;
    let signatureBytes = "0x";
    let dynamicBytes = "";
    for (const sig of signatures) {
        if (sig.dynamic) {
            const dynamicPartPosition = (signatures.length * SIGNATURE_LENGTH_BYTES +
                dynamicBytes.length / 2)
                .toString(16)
                .padStart(64, "0");
            const dynamicPartLength = (sig.data.slice(2).length / 2)
                .toString(16)
                .padStart(64, "0");
            const staticSignature = `${sig.signer.slice(2).padStart(64, "0")}${dynamicPartPosition}00`;
            const dynamicPartWithLength = `${dynamicPartLength}${sig.data.slice(2)}`;
            signatureBytes += staticSignature;
            dynamicBytes += dynamicPartWithLength;
        }
        else {
            signatureBytes += sig.data.slice(2);
        }
    }
    signatureBytes += dynamicBytes;
    return signatureBytes;
};
exports.concatSignatures = concatSignatures;
const getWebAuthnSignature = async ({ owner, hash }) => {
    const { signature: signatureData, webauthn } = await owner.sign({
        hash
    });
    const signature = ox_1.Signature.fromHex(signatureData);
    const match = webauthn.clientDataJSON.match(/^\{"type":"webauthn.get","challenge":"[A-Za-z0-9\-_]{43}",(.*)\}$/);
    if (!match) {
        throw new Error("challenge not found in client data JSON");
    }
    const [, fields] = match;
    return (0, viem_1.encodeAbiParameters)([
        { name: "authenticatorData", type: "bytes" },
        { name: "clientDataJSON", type: "string" },
        { name: "signature", type: "uint256[2]" }
    ], [
        webauthn.authenticatorData,
        fields,
        [BigInt(signature.r), BigInt(signature.s)]
    ]);
};
exports.getWebAuthnSignature = getWebAuthnSignature;
async function signUserOperation(parameters) {
    const { chainId, entryPoint, validAfter = 0, validUntil = 0, safe4337ModuleAddress: _safe4337ModuleAddress, version, owners, signatures: existingSignatures, account, ...userOperation } = parameters;
    const { safe4337ModuleAddress } = (0, toSafeSmartAccount_js_1.getDefaultAddresses)(version, entryPoint.version, {
        safe4337ModuleAddress: _safe4337ModuleAddress
    });
    const message = {
        safe: userOperation.sender,
        callData: userOperation.callData,
        nonce: userOperation.nonce,
        initCode: userOperation.initCode ?? "0x",
        maxFeePerGas: userOperation.maxFeePerGas,
        maxPriorityFeePerGas: userOperation.maxPriorityFeePerGas,
        preVerificationGas: userOperation.preVerificationGas,
        verificationGasLimit: userOperation.verificationGasLimit,
        callGasLimit: userOperation.callGasLimit,
        paymasterAndData: userOperation.paymasterAndData ?? "0x",
        validAfter: validAfter,
        validUntil: validUntil,
        entryPoint: entryPoint.address
    };
    if ("initCode" in userOperation) {
        message.paymasterAndData = userOperation.paymasterAndData ?? "0x";
    }
    if ("factory" in userOperation) {
        if (userOperation.factory && userOperation.factoryData) {
            message.initCode = (0, viem_1.concatHex)([
                userOperation.factory,
                userOperation.factoryData
            ]);
        }
        if (!userOperation.sender) {
            throw new Error("Sender is required");
        }
        message.paymasterAndData = (0, toSafeSmartAccount_js_1.getPaymasterAndData)({
            ...userOperation,
            sender: userOperation.sender
        });
    }
    const localOwner = (0, toSafeSmartAccount_js_1.isWebAuthnAccount)(account)
        ? account
        : await (0, index_js_1.toOwner)({
            owner: account
        });
    const signer = (0, toSafeSmartAccount_js_1.isWebAuthnAccount)(localOwner)
        ? parameters.safeWebAuthnSharedSignerAddress
        : localOwner.address;
    if (!signer) {
        throw new Error("no signer found");
    }
    let unPackedSignatures = [];
    if (existingSignatures) {
        try {
            const decoded = (0, viem_1.decodeAbiParameters)([
                {
                    components: [
                        { type: "address", name: "signer" },
                        { type: "bytes", name: "data" },
                        { type: "bool", name: "dynamic" }
                    ],
                    name: "signatures",
                    type: "tuple[]"
                }
            ], existingSignatures);
            unPackedSignatures = decoded[0];
        }
        catch {
            const decoded = (0, viem_1.decodeAbiParameters)([
                {
                    components: [
                        { type: "address", name: "signer" },
                        { type: "bytes", name: "data" }
                    ],
                    name: "signatures",
                    type: "tuple[]"
                }
            ], existingSignatures);
            unPackedSignatures = decoded[0].map((sig) => ({
                ...sig,
                dynamic: false
            }));
        }
    }
    const signatures = [
        ...unPackedSignatures,
        {
            signer,
            dynamic: (0, toSafeSmartAccount_js_1.isWebAuthnAccount)(localOwner),
            data: await (async () => {
                if ((0, toSafeSmartAccount_js_1.isWebAuthnAccount)(localOwner)) {
                    const safeHash = (0, viem_1.hashTypedData)({
                        domain: {
                            chainId,
                            verifyingContract: safe4337ModuleAddress
                        },
                        types: entryPoint.version === "0.6"
                            ? toSafeSmartAccount_js_1.EIP712_SAFE_OPERATION_TYPE_V06
                            : toSafeSmartAccount_js_1.EIP712_SAFE_OPERATION_TYPE_V07,
                        primaryType: "SafeOp",
                        message: message
                    });
                    return (0, exports.getWebAuthnSignature)({
                        owner: localOwner,
                        hash: safeHash
                    });
                }
                return localOwner.signTypedData({
                    domain: {
                        chainId,
                        verifyingContract: safe4337ModuleAddress
                    },
                    types: entryPoint.version === "0.6"
                        ? toSafeSmartAccount_js_1.EIP712_SAFE_OPERATION_TYPE_V06
                        : toSafeSmartAccount_js_1.EIP712_SAFE_OPERATION_TYPE_V07,
                    primaryType: "SafeOp",
                    message: message
                });
            })()
        }
    ];
    if (signatures.length !== owners.length) {
        return (0, viem_1.encodeAbiParameters)([
            {
                components: [
                    { type: "address", name: "signer" },
                    { type: "bytes", name: "data" },
                    { type: "bool", name: "dynamic" }
                ],
                name: "signatures",
                type: "tuple[]"
            }
        ], [signatures]);
    }
    return (0, viem_1.encodePacked)(["uint48", "uint48", "bytes"], [validAfter, validUntil, (0, exports.concatSignatures)(signatures)]);
}
//# sourceMappingURL=signUserOperation.js.map