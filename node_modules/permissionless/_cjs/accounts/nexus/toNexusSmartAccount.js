"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toNexusSmartAccount = toNexusSmartAccount;
const viem_1 = require("viem");
const account_abstraction_1 = require("viem/account-abstraction");
const actions_1 = require("viem/actions");
const utils_1 = require("viem/utils");
const getAccountNonce_js_1 = require("../../actions/public/getAccountNonce.js");
const decode7579Calls_js_1 = require("../../utils/decode7579Calls.js");
const encode7579Calls_js_1 = require("../../utils/encode7579Calls.js");
const toOwner_js_1 = require("../../utils/toOwner.js");
const wrapMessageHash = (messageHash, { accountAddress, version, chainId }) => {
    const _domainSeparator = (0, viem_1.domainSeparator)({
        domain: {
            name: "Nexus",
            version: version,
            chainId,
            verifyingContract: accountAddress
        }
    });
    const parentStructHash = (0, viem_1.keccak256)((0, viem_1.encodeAbiParameters)([{ type: "bytes32" }, { type: "bytes32" }], [
        (0, viem_1.keccak256)((0, viem_1.stringToHex)("PersonalSign(bytes prefixed)")),
        messageHash
    ]));
    return (0, viem_1.keccak256)((0, viem_1.concatHex)(["0x1901", _domainSeparator, parentStructHash]));
};
const BICONOMY_ADDRESSES = {
    K1_VALIDATOR_FACTORY_ADDRESS: "0x00000bb19a3579F4D779215dEf97AFbd0e30DB55",
    K1_VALIDATOR_ADDRESS: "0x00000004171351c442B202678c48D8AB5B321E8f"
};
async function toNexusSmartAccount(parameters) {
    const { owners, client, index = 0n, address, version, factoryAddress = BICONOMY_ADDRESSES.K1_VALIDATOR_FACTORY_ADDRESS, validatorAddress = BICONOMY_ADDRESSES.K1_VALIDATOR_ADDRESS, attesters = [], threshold = 0 } = parameters;
    const localOwner = await (0, toOwner_js_1.toOwner)({ owner: owners[0] });
    const entryPoint = {
        address: parameters.entryPoint?.address ?? account_abstraction_1.entryPoint07Address,
        abi: account_abstraction_1.entryPoint07Abi,
        version: parameters.entryPoint?.version ?? "0.7"
    };
    let accountAddress = address;
    const getFactoryArgs = async () => {
        return {
            factory: factoryAddress,
            factoryData: (0, viem_1.encodeFunctionData)({
                abi: [
                    {
                        name: "createAccount",
                        type: "function",
                        stateMutability: "nonpayable",
                        inputs: [
                            { type: "address", name: "eoaOwner" },
                            { type: "uint256", name: "index" },
                            { type: "address[]", name: "attesters" },
                            { type: "uint8", name: "threshold" }
                        ],
                        outputs: [{ type: "address" }]
                    }
                ],
                functionName: "createAccount",
                args: [
                    localOwner.address,
                    index,
                    attesters.sort((left, right) => left.toLowerCase().localeCompare(right.toLowerCase())),
                    threshold
                ]
            })
        };
    };
    let chainId;
    const getMemoizedChainId = async () => {
        if (chainId)
            return chainId;
        chainId = client.chain
            ? client.chain.id
            : await (0, utils_1.getAction)(client, actions_1.getChainId, "getChainId")({});
        return chainId;
    };
    return (0, account_abstraction_1.toSmartAccount)({
        client,
        entryPoint,
        getFactoryArgs,
        async getAddress() {
            if (accountAddress)
                return accountAddress;
            accountAddress = await (0, actions_1.readContract)(client, {
                address: factoryAddress,
                abi: [
                    {
                        name: "computeAccountAddress",
                        type: "function",
                        stateMutability: "view",
                        inputs: [
                            { type: "address", name: "eoaOwner" },
                            { type: "uint256", name: "index" },
                            { type: "address[]", name: "attesters" },
                            { type: "uint8", name: "threshold" }
                        ],
                        outputs: [{ type: "address" }]
                    }
                ],
                functionName: "computeAccountAddress",
                args: [
                    localOwner.address,
                    index,
                    attesters.sort((left, right) => left.toLowerCase().localeCompare(right.toLowerCase())),
                    threshold
                ]
            });
            return accountAddress;
        },
        async getNonce(args) {
            const TIMESTAMP_ADJUSTMENT = 16777215n;
            const defaultedKey = (args?.key ?? 0n) % TIMESTAMP_ADJUSTMENT;
            const defaultedValidationMode = "0x00";
            const key = (0, viem_1.concat)([
                (0, viem_1.toHex)(defaultedKey, { size: 3 }),
                defaultedValidationMode,
                validatorAddress
            ]);
            const address = await this.getAddress();
            return (0, getAccountNonce_js_1.getAccountNonce)(client, {
                address,
                entryPointAddress: entryPoint.address,
                key: BigInt(key)
            });
        },
        encodeCalls: async (calls) => {
            return (0, encode7579Calls_js_1.encode7579Calls)({
                mode: {
                    type: calls.length > 1 ? "batchcall" : "call",
                    revertOnError: false,
                    selector: "0x",
                    context: "0x"
                },
                callData: calls
            });
        },
        async decodeCalls(callData) {
            return (0, decode7579Calls_js_1.decode7579Calls)(callData).callData;
        },
        async getStubSignature() {
            const dynamicPart = validatorAddress.substring(2).padEnd(40, "0");
            return `0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000${dynamicPart}000000000000000000000000000000000000000000000000000000000000004181d4b4981670cb18f99f0b4a66446df1bf5b204d24cfcb659bf38ba27a4359b5711649ec2423c5e1247245eba2964679b6a1dbb85c992ae40b9b00c6935b02ff1b00000000000000000000000000000000000000000000000000000000000000`;
        },
        async sign({ hash }) {
            return this.signMessage({ message: hash });
        },
        async signMessage({ message }) {
            const wrappedMessageHash = wrapMessageHash((0, viem_1.hashMessage)(message), {
                version,
                accountAddress: await this.getAddress(),
                chainId: await getMemoizedChainId()
            });
            const signature = await localOwner.signMessage({
                message: {
                    raw: wrappedMessageHash
                }
            });
            return (0, viem_1.encodePacked)(["address", "bytes"], [validatorAddress, signature]);
        },
        async signTypedData(typedData) {
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
            const typedHash = (0, viem_1.hashTypedData)({
                message,
                primaryType,
                types,
                domain
            });
            const wrappedMessageHash = wrapMessageHash(typedHash, {
                version,
                accountAddress: await this.getAddress(),
                chainId: await getMemoizedChainId()
            });
            const signature = await localOwner.signMessage({
                message: {
                    raw: wrappedMessageHash
                }
            });
            return (0, viem_1.encodePacked)(["address", "bytes"], [validatorAddress, signature]);
        },
        async signUserOperation(parameters) {
            const { chainId = await getMemoizedChainId(), ...userOperation } = parameters;
            if (!chainId)
                throw new Error("Chain id not found");
            const hash = (0, account_abstraction_1.getUserOperationHash)({
                userOperation: {
                    ...userOperation,
                    sender: userOperation.sender ?? (await this.getAddress()),
                    signature: "0x"
                },
                entryPointAddress: entryPoint.address,
                entryPointVersion: entryPoint.version,
                chainId: chainId
            });
            return await localOwner.signMessage({
                message: { raw: hash }
            });
        }
    });
}
//# sourceMappingURL=toNexusSmartAccount.js.map