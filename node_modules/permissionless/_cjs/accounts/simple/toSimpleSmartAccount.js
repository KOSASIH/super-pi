"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSimpleSmartAccount = toSimpleSmartAccount;
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
                        internalType: "contract SimpleAccount",
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
const getFactoryAddress = (entryPointVersion, factoryAddress) => {
    if (factoryAddress)
        return factoryAddress;
    switch (entryPointVersion) {
        case "0.8":
            return "0x13E9ed32155810FDbd067D4522C492D6f68E5944";
        case "0.7":
            return "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985";
        default:
            return "0x9406Cc6185a346906296840746125a0E44976454";
    }
};
const getEntryPointAbi = (entryPointVersion) => {
    switch (entryPointVersion) {
        case "0.8":
            return account_abstraction_1.entryPoint08Abi;
        case "0.7":
            return account_abstraction_1.entryPoint07Abi;
        default:
            return account_abstraction_1.entryPoint06Abi;
    }
};
async function toSimpleSmartAccount(parameters) {
    const { client, owner, factoryAddress: _factoryAddress, index = BigInt(0), eip7702 = false, address = eip7702 ? owner.address : undefined, nonceKey, accountLogicAddress = "0xe6Cae83BdE06E4c305530e199D7217f42808555B" } = parameters;
    const localOwner = await (0, toOwner_js_1.toOwner)({
        owner,
        address
    });
    const entryPoint = parameters.entryPoint
        ? {
            address: parameters.entryPoint.address,
            abi: getEntryPointAbi(parameters.entryPoint.version),
            version: parameters.entryPoint.version
        }
        : eip7702
            ? {
                address: account_abstraction_1.entryPoint08Address,
                abi: getEntryPointAbi("0.8"),
                version: "0.8"
            }
            : {
                address: account_abstraction_1.entryPoint07Address,
                abi: getEntryPointAbi("0.7"),
                version: "0.7"
            };
    const factoryAddress = getFactoryAddress(entryPoint.version, _factoryAddress);
    let chainId;
    const getMemoizedChainId = async () => {
        if (chainId)
            return chainId;
        chainId = client.chain
            ? client.chain.id
            : await (0, utils_1.getAction)(client, actions_1.getChainId, "getChainId")({});
        return chainId;
    };
    const getFactoryArgsFunc = () => async () => {
        return {
            factory: factoryAddress,
            factoryData: await getAccountInitCode(localOwner.address, index)
        };
    };
    const { accountAddress, getFactoryArgs } = await (async () => {
        if (eip7702) {
            return {
                accountAddress: localOwner.address,
                getFactoryArgs: async () => {
                    return {
                        factory: undefined,
                        factoryData: undefined
                    };
                }
            };
        }
        const getFactoryArgs = getFactoryArgsFunc();
        if (address) {
            return { accountAddress: address, getFactoryArgs };
        }
        const { factory, factoryData } = await getFactoryArgs();
        const accountAddress = await (0, getSenderAddress_js_1.getSenderAddress)(client, {
            factory,
            factoryData,
            entryPointAddress: entryPoint.address
        });
        return { accountAddress, getFactoryArgs };
    })();
    return (0, account_abstraction_1.toSmartAccount)({
        client,
        entryPoint,
        getFactoryArgs,
        extend: eip7702
            ? {
                implementation: accountLogicAddress
            }
            : undefined,
        authorization: eip7702
            ? {
                address: accountLogicAddress,
                account: localOwner
            }
            : undefined,
        async getAddress() {
            return accountAddress;
        },
        async encodeCalls(calls) {
            if (calls.length > 1) {
                if (entryPoint.version === "0.8") {
                    return (0, viem_1.encodeFunctionData)({
                        abi: executeBatch08Abi,
                        functionName: "executeBatch",
                        args: [
                            calls.map((a) => ({
                                target: a.to,
                                value: a.value ?? 0n,
                                data: a.data ?? "0x"
                            }))
                        ]
                    });
                }
                if (entryPoint.version === "0.7") {
                    return (0, viem_1.encodeFunctionData)({
                        abi: executeBatch07Abi,
                        functionName: "executeBatch",
                        args: [
                            calls.map((a) => a.to),
                            calls.map((a) => a.value ?? 0n),
                            calls.map((a) => a.data ?? "0x")
                        ]
                    });
                }
                return (0, viem_1.encodeFunctionData)({
                    abi: executeBatch06Abi,
                    functionName: "executeBatch",
                    args: [
                        calls.map((a) => a.to),
                        calls.map((a) => a.data ?? "0x")
                    ]
                });
            }
            const call = calls.length === 0 ? undefined : calls[0];
            if (!call) {
                throw new Error("No calls to encode");
            }
            return (0, viem_1.encodeFunctionData)({
                abi: executeSingleAbi,
                functionName: "execute",
                args: [call.to, call.value ?? 0n, call.data ?? "0x"]
            });
        },
        decodeCalls: async (callData) => {
            try {
                const calls = [];
                if (entryPoint.version === "0.8") {
                    const decodedV8 = (0, viem_1.decodeFunctionData)({
                        abi: executeBatch08Abi,
                        data: callData
                    });
                    for (const call of decodedV8.args[0]) {
                        calls.push({
                            to: call.target,
                            data: call.data,
                            value: call.value
                        });
                    }
                    return calls;
                }
                if (entryPoint.version === "0.7") {
                    const decodedV7 = (0, viem_1.decodeFunctionData)({
                        abi: executeBatch07Abi,
                        data: callData
                    });
                    const destinations = decodedV7.args[0];
                    const values = decodedV7.args[1];
                    const datas = decodedV7.args[2];
                    for (let i = 0; i < destinations.length; i++) {
                        calls.push({
                            to: destinations[i],
                            data: datas[i],
                            value: values[i]
                        });
                    }
                    return calls;
                }
                if (entryPoint.version === "0.6") {
                    const decodedV6 = (0, viem_1.decodeFunctionData)({
                        abi: executeBatch06Abi,
                        data: callData
                    });
                    const destinations = decodedV6.args[0];
                    const datas = decodedV6.args[1];
                    for (let i = 0; i < destinations.length; i++) {
                        calls.push({
                            to: destinations[i],
                            data: datas[i],
                            value: 0n
                        });
                    }
                    return calls;
                }
                return calls;
            }
            catch (_) {
                const decodedSingle = (0, viem_1.decodeFunctionData)({
                    abi: executeSingleAbi,
                    data: callData
                });
                return [
                    {
                        to: decodedSingle.args[0],
                        value: decodedSingle.args[1],
                        data: decodedSingle.args[2]
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
            return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
        },
        async sign({ hash }) {
            return this.signMessage({ message: hash });
        },
        signMessage: async (_) => {
            throw new Error("Simple account isn't 1271 compliant");
        },
        signTypedData: async (_) => {
            throw new Error("Simple account isn't 1271 compliant");
        },
        async signUserOperation(parameters) {
            const { chainId = await getMemoizedChainId(), ...userOperation } = parameters;
            if (entryPoint.version === "0.8") {
                const typedData = (0, account_abstraction_1.getUserOperationTypedData)({
                    chainId,
                    entryPointAddress: entryPoint.address,
                    userOperation: {
                        ...userOperation,
                        sender: await this.getAddress(),
                        signature: "0x"
                    }
                });
                return localOwner.signTypedData(typedData);
            }
            return (0, actions_1.signMessage)(client, {
                account: localOwner,
                message: {
                    raw: (0, account_abstraction_1.getUserOperationHash)({
                        userOperation: {
                            ...userOperation,
                            sender: userOperation.sender ??
                                (await this.getAddress()),
                            signature: "0x"
                        },
                        entryPointAddress: entryPoint.address,
                        entryPointVersion: entryPoint.version,
                        chainId: chainId
                    })
                }
            });
        }
    });
}
const executeSingleAbi = [
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
];
const executeBatch06Abi = [
    {
        inputs: [
            {
                internalType: "address[]",
                name: "dest",
                type: "address[]"
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
];
const executeBatch07Abi = [
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
];
const executeBatch08Abi = [
    {
        type: "function",
        name: "executeBatch",
        inputs: [
            {
                name: "calls",
                type: "tuple[]",
                internalType: "struct BaseAccount.Call[]",
                components: [
                    {
                        name: "target",
                        type: "address",
                        internalType: "address"
                    },
                    {
                        name: "value",
                        type: "uint256",
                        internalType: "uint256"
                    },
                    {
                        name: "data",
                        type: "bytes",
                        internalType: "bytes"
                    }
                ]
            }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
];
//# sourceMappingURL=toSimpleSmartAccount.js.map