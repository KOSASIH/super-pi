"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLightSmartAccount = toLightSmartAccount;
const viem_1 = require("viem");
const account_abstraction_1 = require("viem/account-abstraction");
const actions_1 = require("viem/actions");
const utils_1 = require("viem/utils");
const getAccountNonce_js_1 = require("../../actions/public/getAccountNonce.js");
const getSenderAddress_js_1 = require("../../actions/public/getSenderAddress.js");
const toOwner_js_1 = require("../../utils/toOwner.js");
const getAccountInitCode = async (owner, index = BigInt(0)) => {
    if (!owner)
        throw new Error("Owner account not found");
    return (0, viem_1.encodeFunctionData)({
        abi: [
            {
                inputs: [
                    {
                        internalType: "address",
                        name: "owner",
                        type: "address"
                    },
                    {
                        internalType: "uint256",
                        name: "salt",
                        type: "uint256"
                    }
                ],
                name: "createAccount",
                outputs: [
                    {
                        internalType: "contract LightAccount",
                        name: "ret",
                        type: "address"
                    }
                ],
                stateMutability: "nonpayable",
                type: "function"
            }
        ],
        functionName: "createAccount",
        args: [owner, index]
    });
};
async function signWith1271WrapperV1(signer, chainId, accountAddress, hashedMessage) {
    return signer.signTypedData({
        domain: {
            chainId: Number(chainId),
            name: "LightAccount",
            verifyingContract: accountAddress,
            version: "1"
        },
        types: {
            LightAccountMessage: [{ name: "message", type: "bytes" }]
        },
        message: {
            message: hashedMessage
        },
        primaryType: "LightAccountMessage"
    });
}
const LIGHT_VERSION_TO_ADDRESSES_MAP = {
    "1.1.0": {
        factoryAddress: "0x00004EC70002a32400f8ae005A26081065620D20"
    },
    "2.0.0": {
        factoryAddress: "0x0000000000400CdFef5E2714E63d8040b700BC24"
    }
};
const getDefaultAddresses = (lightAccountVersion, { factoryAddress: _factoryAddress }) => {
    const factoryAddress = _factoryAddress ??
        LIGHT_VERSION_TO_ADDRESSES_MAP[lightAccountVersion].factoryAddress;
    return {
        factoryAddress
    };
};
var SignatureType;
(function (SignatureType) {
    SignatureType["EOA"] = "0x00";
})(SignatureType || (SignatureType = {}));
async function toLightSmartAccount(parameters) {
    const { version, factoryAddress: _factoryAddress, address, owner, client, index = BigInt(0), nonceKey } = parameters;
    const localOwner = await (0, toOwner_js_1.toOwner)({ owner });
    const entryPoint = {
        address: parameters.entryPoint?.address ?? account_abstraction_1.entryPoint07Address,
        abi: (parameters.entryPoint?.version ?? "0.7") === "0.6"
            ? account_abstraction_1.entryPoint06Abi
            : account_abstraction_1.entryPoint07Abi,
        version: parameters.entryPoint?.version ?? "0.7"
    };
    const { factoryAddress } = getDefaultAddresses(version, {
        factoryAddress: _factoryAddress
    });
    let accountAddress = address;
    let chainId;
    const getMemoizedChainId = async () => {
        if (chainId)
            return chainId;
        chainId = client.chain
            ? client.chain.id
            : await (0, utils_1.getAction)(client, actions_1.getChainId, "getChainId")({});
        return chainId;
    };
    const getFactoryArgs = async () => {
        return {
            factory: factoryAddress,
            factoryData: await getAccountInitCode(localOwner.address, index)
        };
    };
    return (0, account_abstraction_1.toSmartAccount)({
        client,
        entryPoint,
        getFactoryArgs,
        async getAddress() {
            if (accountAddress)
                return accountAddress;
            const { factory, factoryData } = await getFactoryArgs();
            accountAddress = await (0, getSenderAddress_js_1.getSenderAddress)(client, {
                factory,
                factoryData,
                entryPointAddress: entryPoint.address
            });
            return accountAddress;
        },
        async encodeCalls(calls) {
            if (calls.length > 1) {
                return (0, viem_1.encodeFunctionData)({
                    abi: [
                        {
                            inputs: [
                                {
                                    internalType: "address[]",
                                    name: "dest",
                                    type: "address[]"
                                },
                                {
                                    internalType: "uint256[]",
                                    name: "value",
                                    type: "uint256[]"
                                },
                                {
                                    internalType: "bytes[]",
                                    name: "func",
                                    type: "bytes[]"
                                }
                            ],
                            name: "executeBatch",
                            outputs: [],
                            stateMutability: "nonpayable",
                            type: "function"
                        }
                    ],
                    functionName: "executeBatch",
                    args: [
                        calls.map((a) => a.to),
                        calls.map((a) => a.value ?? 0n),
                        calls.map((a) => a.data ?? "0x")
                    ]
                });
            }
            const call = calls.length === 0 ? undefined : calls[0];
            if (!call) {
                throw new Error("No calls to encode");
            }
            return (0, viem_1.encodeFunctionData)({
                abi: [
                    {
                        inputs: [
                            {
                                internalType: "address",
                                name: "dest",
                                type: "address"
                            },
                            {
                                internalType: "uint256",
                                name: "value",
                                type: "uint256"
                            },
                            {
                                internalType: "bytes",
                                name: "func",
                                type: "bytes"
                            }
                        ],
                        name: "execute",
                        outputs: [],
                        stateMutability: "nonpayable",
                        type: "function"
                    }
                ],
                functionName: "execute",
                args: [call.to, call.value ?? 0n, call.data ?? "0x"]
            });
        },
        async decodeCalls(callData) {
            try {
                const decoded = (0, viem_1.decodeFunctionData)({
                    abi: [
                        {
                            inputs: [
                                {
                                    internalType: "address[]",
                                    name: "dest",
                                    type: "address[]"
                                },
                                {
                                    internalType: "uint256[]",
                                    name: "value",
                                    type: "uint256[]"
                                },
                                {
                                    internalType: "bytes[]",
                                    name: "func",
                                    type: "bytes[]"
                                }
                            ],
                            name: "executeBatch",
                            outputs: [],
                            stateMutability: "nonpayable",
                            type: "function"
                        }
                    ],
                    data: callData
                });
                if (decoded.functionName === "executeBatch") {
                    const calls = [];
                    for (let i = 0; i < decoded.args[0].length; i++) {
                        calls.push({
                            to: decoded.args[0][i],
                            value: decoded.args[1][i],
                            data: decoded.args[2][i]
                        });
                    }
                    return calls;
                }
                throw new Error("Invalid function name");
            }
            catch (_) {
                const decoded = (0, viem_1.decodeFunctionData)({
                    abi: [
                        {
                            inputs: [
                                {
                                    internalType: "address",
                                    name: "dest",
                                    type: "address"
                                },
                                {
                                    internalType: "uint256",
                                    name: "value",
                                    type: "uint256"
                                },
                                {
                                    internalType: "bytes",
                                    name: "func",
                                    type: "bytes"
                                }
                            ],
                            name: "execute",
                            outputs: [],
                            stateMutability: "nonpayable",
                            type: "function"
                        }
                    ],
                    data: callData
                });
                return [
                    {
                        to: decoded.args[0],
                        value: decoded.args[1],
                        data: decoded.args[2]
                    }
                ];
            }
        },
        async getNonce(args) {
            return (0, getAccountNonce_js_1.getAccountNonce)(client, {
                address: await this.getAddress(),
                entryPointAddress: entryPoint.address,
                key: nonceKey ?? args?.key
            });
        },
        async getStubSignature() {
            const signature = "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
            switch (version) {
                case "1.1.0":
                    return signature;
                case "2.0.0":
                    return (0, viem_1.concat)([SignatureType.EOA, signature]);
                default:
                    throw new Error("Unknown Light Account version");
            }
        },
        async sign({ hash }) {
            return this.signMessage({ message: hash });
        },
        async signMessage({ message }) {
            const signature = await signWith1271WrapperV1(localOwner, await getMemoizedChainId(), await this.getAddress(), (0, viem_1.hashMessage)(message));
            switch (version) {
                case "1.1.0":
                    return signature;
                case "2.0.0":
                    return (0, viem_1.concat)([SignatureType.EOA, signature]);
                default:
                    throw new Error("Unknown Light Account version");
            }
        },
        async signTypedData(typedData) {
            const signature = await signWith1271WrapperV1(localOwner, await getMemoizedChainId(), await this.getAddress(), (0, viem_1.hashTypedData)(typedData));
            switch (version) {
                case "1.1.0":
                    return signature;
                case "2.0.0":
                    return (0, viem_1.concat)([SignatureType.EOA, signature]);
                default:
                    throw new Error("Unknown Light Account version");
            }
        },
        async signUserOperation(parameters) {
            const { chainId = await getMemoizedChainId(), ...userOperation } = parameters;
            const hash = (0, account_abstraction_1.getUserOperationHash)({
                userOperation: {
                    ...userOperation,
                    signature: "0x"
                },
                entryPointAddress: entryPoint.address,
                entryPointVersion: entryPoint.version,
                chainId: chainId
            });
            const signature = await (0, actions_1.signMessage)(client, {
                account: localOwner,
                message: {
                    raw: hash
                }
            });
            switch (version) {
                case "1.1.0":
                    return signature;
                case "2.0.0":
                    return (0, viem_1.concat)([SignatureType.EOA, signature]);
                default:
                    throw new Error("Unknown Light Account version");
            }
        }
    });
}
//# sourceMappingURL=toLightSmartAccount.js.map