"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEcdsaRootIdentifierForKernelV3 = exports.KERNEL_VERSION_TO_ADDRESSES_MAP = void 0;
exports.toKernelSmartAccount = toKernelSmartAccount;
const ox_1 = require("ox");
const viem_1 = require("viem");
const account_abstraction_1 = require("viem/account-abstraction");
const actions_1 = require("viem/actions");
const utils_1 = require("viem/utils");
const getAccountNonce_js_1 = require("../../actions/public/getAccountNonce.js");
const getSenderAddress_js_1 = require("../../actions/public/getSenderAddress.js");
const toOwner_js_1 = require("../../utils/toOwner.js");
const KernelAccountAbi_js_1 = require("./abi/KernelAccountAbi.js");
const KernelV3AccountAbi_js_1 = require("./abi/KernelV3AccountAbi.js");
const KernelV3FactoryAbi_js_1 = require("./abi/KernelV3FactoryAbi.js");
const KernelV3MetaFactoryAbi_js_1 = require("./abi/KernelV3MetaFactoryAbi.js");
const constants_js_1 = require("./constants.js");
const decodeCallData_js_1 = require("./utils/decodeCallData.js");
const encodeCallData_js_1 = require("./utils/encodeCallData.js");
const getNonceKey_js_1 = require("./utils/getNonceKey.js");
const isKernelV2_js_1 = require("./utils/isKernelV2.js");
const isWebAuthnAccount_js_1 = require("./utils/isWebAuthnAccount.js");
const signMessage_js_1 = require("./utils/signMessage.js");
const signTypedData_js_1 = require("./utils/signTypedData.js");
const createAccountAbi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_implementation",
                type: "address"
            },
            {
                internalType: "bytes",
                name: "_data",
                type: "bytes"
            },
            {
                internalType: "uint256",
                name: "_index",
                type: "uint256"
            }
        ],
        name: "createAccount",
        outputs: [
            {
                internalType: "address",
                name: "proxy",
                type: "address"
            }
        ],
        stateMutability: "payable",
        type: "function"
    }
];
exports.KERNEL_VERSION_TO_ADDRESSES_MAP = {
    "0.2.1": {
        ECDSA_VALIDATOR: "0xd9AB5096a832b9ce79914329DAEE236f8Eea0390",
        ACCOUNT_LOGIC: "0xf048AD83CB2dfd6037A43902a2A5Be04e53cd2Eb",
        FACTORY_ADDRESS: "0x5de4839a76cf55d0c90e2061ef4386d962E15ae3"
    },
    "0.2.2": {
        ECDSA_VALIDATOR: "0xd9AB5096a832b9ce79914329DAEE236f8Eea0390",
        ACCOUNT_LOGIC: "0x0DA6a956B9488eD4dd761E59f52FDc6c8068E6B5",
        FACTORY_ADDRESS: "0x5de4839a76cf55d0c90e2061ef4386d962E15ae3"
    },
    "0.2.3": {
        ECDSA_VALIDATOR: "0xd9AB5096a832b9ce79914329DAEE236f8Eea0390",
        ACCOUNT_LOGIC: "0xD3F582F6B4814E989Ee8E96bc3175320B5A540ab",
        FACTORY_ADDRESS: "0x5de4839a76cf55d0c90e2061ef4386d962E15ae3"
    },
    "0.2.4": {
        ECDSA_VALIDATOR: "0xd9AB5096a832b9ce79914329DAEE236f8Eea0390",
        ACCOUNT_LOGIC: "0xd3082872F8B06073A021b4602e022d5A070d7cfC",
        FACTORY_ADDRESS: "0x5de4839a76cf55d0c90e2061ef4386d962E15ae3"
    },
    "0.3.0-beta": {
        ECDSA_VALIDATOR: "0x8104e3Ad430EA6d354d013A6789fDFc71E671c43",
        ACCOUNT_LOGIC: "0x94F097E1ebEB4ecA3AAE54cabb08905B239A7D27",
        FACTORY_ADDRESS: "0x6723b44Abeec4E71eBE3232BD5B455805baDD22f",
        META_FACTORY_ADDRESS: "0xd703aaE79538628d27099B8c4f621bE4CCd142d5",
        WEB_AUTHN_VALIDATOR: "0xbA45a2BFb8De3D24cA9D7F1B551E14dFF5d690Fd"
    },
    "0.3.1": {
        ECDSA_VALIDATOR: "0x845ADb2C711129d4f3966735eD98a9F09fC4cE57",
        ACCOUNT_LOGIC: "0xBAC849bB641841b44E965fB01A4Bf5F074f84b4D",
        FACTORY_ADDRESS: "0xaac5D4240AF87249B3f71BC8E4A2cae074A3E419",
        META_FACTORY_ADDRESS: "0xd703aaE79538628d27099B8c4f621bE4CCd142d5",
        WEB_AUTHN_VALIDATOR: "0xbA45a2BFb8De3D24cA9D7F1B551E14dFF5d690Fd"
    },
    "0.3.2": {
        ECDSA_VALIDATOR: "0x845ADb2C711129d4f3966735eD98a9F09fC4cE57",
        ACCOUNT_LOGIC: "0xD830D15D3dc0C269F3dBAa0F3e8626d33CFdaBe1",
        FACTORY_ADDRESS: "0x7a1dBAB750f12a90EB1B60D2Ae3aD17D4D81EfFe",
        META_FACTORY_ADDRESS: "0xd703aaE79538628d27099B8c4f621bE4CCd142d5"
    },
    "0.3.3": {
        ECDSA_VALIDATOR: "0x845ADb2C711129d4f3966735eD98a9F09fC4cE57",
        ACCOUNT_LOGIC: "0xd6CEDDe84be40893d153Be9d467CD6aD37875b28",
        FACTORY_ADDRESS: "0x2577507b78c2008Ff367261CB6285d44ba5eF2E9",
        META_FACTORY_ADDRESS: "0xd703aaE79538628d27099B8c4f621bE4CCd142d5"
    }
};
const getDefaultKernelVersion = (entryPointVersion, version, eip7702) => {
    if (eip7702) {
        return "0.3.3";
    }
    if (version) {
        return version;
    }
    return (entryPointVersion === "0.6" ? "0.2.2" : "0.3.0-beta");
};
const getDefaultAddresses = ({ validatorAddress: _validatorAddress, accountLogicAddress: _accountLogicAddress, factoryAddress: _factoryAddress, metaFactoryAddress: _metaFactoryAddress, kernelVersion, isWebAuthn }) => {
    const addresses = exports.KERNEL_VERSION_TO_ADDRESSES_MAP[kernelVersion];
    const validatorAddress = _validatorAddress ??
        (isWebAuthn ? addresses.WEB_AUTHN_VALIDATOR : addresses.ECDSA_VALIDATOR);
    const accountLogicAddress = _accountLogicAddress ?? addresses.ACCOUNT_LOGIC;
    const factoryAddress = _factoryAddress ?? addresses.FACTORY_ADDRESS;
    const metaFactoryAddress = _metaFactoryAddress ?? addresses?.META_FACTORY_ADDRESS ?? viem_1.zeroAddress;
    return {
        validatorAddress,
        accountLogicAddress,
        factoryAddress,
        metaFactoryAddress
    };
};
const getEcdsaRootIdentifierForKernelV3 = (validatorAddress, eip7702 = false) => {
    return (0, viem_1.concatHex)([
        eip7702 ? constants_js_1.VALIDATOR_TYPE.EIP7702 : constants_js_1.VALIDATOR_TYPE.VALIDATOR,
        eip7702 ? "0x" : validatorAddress
    ]);
};
exports.getEcdsaRootIdentifierForKernelV3 = getEcdsaRootIdentifierForKernelV3;
const getInitializationData = ({ entryPoint: { version: entryPointVersion }, kernelVersion, validatorData, validatorAddress }) => {
    if (entryPointVersion === "0.6") {
        return (0, viem_1.encodeFunctionData)({
            abi: KernelAccountAbi_js_1.KernelInitAbi,
            functionName: "initialize",
            args: [validatorAddress, validatorData]
        });
    }
    if (kernelVersion === "0.3.0-beta") {
        return (0, viem_1.encodeFunctionData)({
            abi: KernelV3AccountAbi_js_1.KernelV3InitAbi,
            functionName: "initialize",
            args: [
                (0, exports.getEcdsaRootIdentifierForKernelV3)(validatorAddress),
                viem_1.zeroAddress,
                validatorData,
                "0x"
            ]
        });
    }
    return (0, viem_1.encodeFunctionData)({
        abi: KernelV3AccountAbi_js_1.KernelV3_1AccountAbi,
        functionName: "initialize",
        args: [
            (0, exports.getEcdsaRootIdentifierForKernelV3)(validatorAddress),
            viem_1.zeroAddress,
            validatorData,
            "0x",
            []
        ]
    });
};
const getValidatorData = async (owner) => {
    if (owner.type === "local") {
        return owner.address;
    }
    if ((0, isWebAuthnAccount_js_1.isWebAuthnAccount)(owner)) {
        const parsedPublicKey = ox_1.PublicKey.fromHex(owner.publicKey);
        const authenticatorIdHash = (0, viem_1.keccak256)(ox_1.Hex.fromBytes(ox_1.Base64.toBytes(owner.id)));
        return (0, viem_1.encodeAbiParameters)([
            {
                components: [
                    { name: "x", type: "uint256" },
                    { name: "y", type: "uint256" }
                ],
                name: "webAuthnData",
                type: "tuple"
            },
            {
                name: "authenticatorIdHash",
                type: "bytes32"
            }
        ], [
            {
                x: parsedPublicKey.x,
                y: parsedPublicKey.y
            },
            authenticatorIdHash
        ]);
    }
    throw new Error("Invalid owner type");
};
const getAccountInitCode = async ({ entryPointVersion, kernelVersion, validatorData, index, factoryAddress, accountLogicAddress, validatorAddress, useMetaFactory }) => {
    const initializationData = getInitializationData({
        entryPoint: { version: entryPointVersion },
        kernelVersion,
        validatorAddress,
        validatorData
    });
    if (entryPointVersion === "0.6") {
        return (0, viem_1.encodeFunctionData)({
            abi: createAccountAbi,
            functionName: "createAccount",
            args: [accountLogicAddress, initializationData, index]
        });
    }
    if (!useMetaFactory) {
        return (0, viem_1.encodeFunctionData)({
            abi: KernelV3FactoryAbi_js_1.KernelV3FactoryAbi,
            functionName: "createAccount",
            args: [initializationData, (0, viem_1.toHex)(index, { size: 32 })]
        });
    }
    return (0, viem_1.encodeFunctionData)({
        abi: KernelV3MetaFactoryAbi_js_1.KernelV3MetaFactoryDeployWithFactoryAbi,
        functionName: "deployWithFactory",
        args: [factoryAddress, initializationData, (0, viem_1.toHex)(index, { size: 32 })]
    });
};
async function toKernelSmartAccount(parameters) {
    const { client, address, index = 0n, version, validatorAddress: _validatorAddress, factoryAddress: _factoryAddress, metaFactoryAddress: _metaFactoryAddress, accountLogicAddress: _accountLogicAddress, useMetaFactory = true, eip7702 = false } = parameters;
    const owners = (() => {
        if (eip7702 && "owner" in parameters) {
            return [parameters.owner];
        }
        if ("owners" in parameters) {
            return parameters.owners;
        }
        throw new Error("Invalid parameters");
    })();
    const isWebAuthn = owners[0].type === "webAuthn";
    const owner = await (() => {
        if (isWebAuthn) {
            return owners[0];
        }
        return (0, toOwner_js_1.toOwner)({
            owner: owners[0]
        });
    })();
    const entryPoint = (() => {
        const address = parameters.entryPoint?.address ?? account_abstraction_1.entryPoint07Address;
        const version = parameters.entryPoint?.version ?? "0.7";
        let abi = account_abstraction_1.entryPoint07Abi;
        if (version === "0.6") {
            abi = account_abstraction_1.entryPoint06Abi;
        }
        return {
            address,
            abi,
            version
        };
    })();
    const kernelVersion = getDefaultKernelVersion(entryPoint.version, version, eip7702);
    const { accountLogicAddress, validatorAddress, factoryAddress, metaFactoryAddress } = getDefaultAddresses({
        validatorAddress: _validatorAddress,
        accountLogicAddress: _accountLogicAddress,
        factoryAddress: _factoryAddress,
        metaFactoryAddress: _metaFactoryAddress,
        kernelVersion,
        isWebAuthn
    });
    if (!validatorAddress) {
        throw new Error("Validator address is required");
    }
    const generateInitCode = async (_useMetaFactory) => getAccountInitCode({
        entryPointVersion: entryPoint.version,
        kernelVersion,
        validatorData: await getValidatorData(owner),
        index,
        factoryAddress,
        accountLogicAddress,
        validatorAddress,
        useMetaFactory: _useMetaFactory
    });
    let chainId;
    const getMemoizedChainId = async () => {
        if (chainId)
            return chainId;
        chainId = client.chain
            ? client.chain.id
            : await (0, utils_1.getAction)(client, actions_1.getChainId, "getChainId")({});
        return chainId;
    };
    const getFactoryArgsFunc = (_useMetaFactory) => async () => {
        return {
            factory: entryPoint.version === "0.6" || _useMetaFactory === false
                ? factoryAddress
                : metaFactoryAddress,
            factoryData: await generateInitCode(_useMetaFactory)
        };
    };
    const { accountAddress, getFactoryArgs } = await (async () => {
        if (eip7702) {
            return {
                accountAddress: owner.address,
                getFactoryArgs: async () => {
                    return {
                        factory: undefined,
                        factoryData: undefined
                    };
                }
            };
        }
        let getFactoryArgs = getFactoryArgsFunc(useMetaFactory === "optional" ? true : useMetaFactory);
        if (address && useMetaFactory !== "optional") {
            return { accountAddress: address, getFactoryArgs };
        }
        const { factory, factoryData } = await getFactoryArgs();
        let accountAddress = await (0, getSenderAddress_js_1.getSenderAddress)(client, {
            factory,
            factoryData,
            entryPointAddress: entryPoint.address
        });
        if (address === accountAddress) {
            return { accountAddress, getFactoryArgs };
        }
        if (useMetaFactory === "optional" && accountAddress === viem_1.zeroAddress) {
            getFactoryArgs = getFactoryArgsFunc(false);
            const { factory, factoryData } = await getFactoryArgs();
            accountAddress = await (0, getSenderAddress_js_1.getSenderAddress)(client, {
                factory,
                factoryData,
                entryPointAddress: entryPoint.address
            });
        }
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
                account: owner
            }
            : undefined,
        async getAddress() {
            return accountAddress;
        },
        async encodeCalls(calls) {
            return (0, encodeCallData_js_1.encodeCallData)({ calls, kernelVersion });
        },
        async decodeCalls(callData) {
            return (0, decodeCallData_js_1.decodeCallData)({ callData, kernelVersion });
        },
        async getNonce(_args) {
            return (0, getAccountNonce_js_1.getAccountNonce)(client, {
                address: await this.getAddress(),
                entryPointAddress: entryPoint.address,
                key: (0, getNonceKey_js_1.getNonceKeyWithEncoding)(kernelVersion, validatorAddress, parameters.nonceKey ?? 0n)
            });
        },
        async getStubSignature() {
            if ((0, isKernelV2_js_1.isKernelV2)(kernelVersion)) {
                return (0, viem_1.concatHex)([constants_js_1.ROOT_MODE_KERNEL_V2, constants_js_1.DUMMY_ECDSA_SIGNATURE]);
            }
            if ((0, isWebAuthnAccount_js_1.isWebAuthnAccount)(owner)) {
                return (0, viem_1.encodeAbiParameters)([
                    { name: "authenticatorData", type: "bytes" },
                    { name: "clientDataJSON", type: "string" },
                    { name: "responseTypeLocation", type: "uint256" },
                    { name: "r", type: "uint256" },
                    { name: "s", type: "uint256" },
                    { name: "usePrecompiled", type: "bool" }
                ], [
                    "0x49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97631d00000000",
                    '{"type":"webauthn.get","challenge":"tbxXNFS9X_4Byr1cMwqKrIGB-_30a0QhZ6y7ucM0BOE","origin":"http://localhost:3000","crossOrigin":false, "other_keys_can_be_added_here":"do not compare clientDataJSON against a template. See https://goo.gl/yabPex"}',
                    1n,
                    44941127272049826721201904734628716258498742255959991581049806490182030242267n,
                    9910254599581058084911561569808925251374718953855182016200087235935345969636n,
                    false
                ]);
            }
            return constants_js_1.DUMMY_ECDSA_SIGNATURE;
        },
        async sign({ hash }) {
            return this.signMessage({ message: hash });
        },
        async signMessage({ message }) {
            if ("isDeployed" in this &&
                !(await this.isDeployed()) &&
                eip7702) {
                throw new Error("Kernel with EIP-7702 isn't 1271 compliant before delegation.");
            }
            const signature = await (0, signMessage_js_1.signMessage)({
                owner,
                message,
                accountAddress: await this.getAddress(),
                kernelVersion: kernelVersion,
                chainId: await getMemoizedChainId(),
                eip7702: eip7702
            });
            if ((0, isKernelV2_js_1.isKernelV2)(kernelVersion)) {
                return signature;
            }
            return (0, viem_1.concatHex)([
                (0, exports.getEcdsaRootIdentifierForKernelV3)(validatorAddress, eip7702),
                signature
            ]);
        },
        async signTypedData(typedData) {
            if ("isDeployed" in this &&
                !(await this.isDeployed()) &&
                eip7702) {
                throw new Error("Kernel with EIP-7702 isn't 1271 compliant before delegation.");
            }
            const signature = await (0, signTypedData_js_1.signTypedData)({
                owner: owner,
                chainId: await getMemoizedChainId(),
                ...typedData,
                accountAddress: await this.getAddress(),
                kernelVersion: kernelVersion,
                eip7702
            });
            if ((0, isKernelV2_js_1.isKernelV2)(kernelVersion)) {
                return signature;
            }
            return (0, viem_1.concatHex)([
                (0, exports.getEcdsaRootIdentifierForKernelV3)(validatorAddress, eip7702),
                signature
            ]);
        },
        async signUserOperation(parameters) {
            const { chainId = await getMemoizedChainId(), ...userOperation } = parameters;
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
            const signature = (0, isWebAuthnAccount_js_1.isWebAuthnAccount)(owner)
                ? await (0, signMessage_js_1.signMessage)({
                    owner,
                    message: { raw: hash },
                    chainId,
                    accountAddress: await this.getAddress(),
                    kernelVersion,
                    eip7702: false
                })
                : await owner.signMessage({
                    message: { raw: hash }
                });
            if ((0, isKernelV2_js_1.isKernelV2)(kernelVersion)) {
                return (0, viem_1.concatHex)(["0x00000000", signature]);
            }
            return signature;
        }
    });
}
//# sourceMappingURL=toKernelSmartAccount.js.map