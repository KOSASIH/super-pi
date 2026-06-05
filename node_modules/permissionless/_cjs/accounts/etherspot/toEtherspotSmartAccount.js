"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toEtherspotSmartAccount = toEtherspotSmartAccount;
const viem_1 = require("viem");
const account_abstraction_1 = require("viem/account-abstraction");
const actions_1 = require("viem/actions");
const utils_1 = require("viem/utils");
const getAccountNonce_js_1 = require("../../actions/public/getAccountNonce.js");
const getSenderAddress_js_1 = require("../../actions/public/getSenderAddress.js");
const decode7579Calls_js_1 = require("../../utils/decode7579Calls.js");
const encode7579Calls_js_1 = require("../../utils/encode7579Calls.js");
const index_js_1 = require("../../utils/index.js");
const constants_js_1 = require("./constants.js");
const getInitMSAData_js_1 = require("./utils/getInitMSAData.js");
const getNonceKey_js_1 = require("./utils/getNonceKey.js");
const createAccountAbi = [
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "salt",
                type: "bytes32"
            },
            {
                internalType: "bytes",
                name: "initCode",
                type: "bytes"
            }
        ],
        name: "createAccount",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            }
        ],
        stateMutability: "payable",
        type: "function"
    }
];
const getDefaultAddresses = ({ validatorAddress: _validatorAddress, metaFactoryAddress: _metaFactoryAddress, bootstrapAddress: _bootstrapAddress }) => {
    const addresses = constants_js_1.DEFAULT_CONTRACT_ADDRESS;
    const validatorAddress = _validatorAddress ?? addresses.validatorAddress;
    const metaFactoryAddress = _metaFactoryAddress ?? addresses?.metaFactoryAddress ?? viem_1.zeroAddress;
    const bootstrapAddress = _bootstrapAddress ?? addresses.bootstrapAddress ?? viem_1.zeroAddress;
    return {
        validatorAddress,
        metaFactoryAddress,
        bootstrapAddress
    };
};
const getInitialisationData = ({ owner, validatorAddress, bootstrapAddress }) => {
    const initMSAData = (0, getInitMSAData_js_1.getInitMSAData)(validatorAddress);
    const initCode = (0, viem_1.encodeAbiParameters)([{ type: "address" }, { type: "address" }, { type: "bytes" }], [owner, bootstrapAddress, initMSAData]);
    return initCode;
};
const getAccountInitCode = async ({ owner, index, validatorAddress, bootstrapAddress }) => {
    if (!owner)
        throw new Error("Owner account not found");
    const initialisationData = getInitialisationData({
        validatorAddress,
        owner,
        bootstrapAddress
    });
    return (0, viem_1.encodeFunctionData)({
        abi: createAccountAbi,
        functionName: "createAccount",
        args: [(0, viem_1.toHex)(index, { size: 32 }), initialisationData]
    });
};
async function toEtherspotSmartAccount(parameters) {
    const { client, owners, address, index = BigInt(0), metaFactoryAddress: _metaFactoryAddress, validatorAddress: _validatorAddress, bootstrapAddress: _bootstrapAddress } = parameters;
    const localOwner = await (0, index_js_1.toOwner)({ owner: owners[0] });
    const entryPoint = {
        address: parameters.entryPoint?.address ?? account_abstraction_1.entryPoint07Address,
        abi: account_abstraction_1.entryPoint07Abi,
        version: parameters.entryPoint?.version ?? "0.7"
    };
    const { validatorAddress, metaFactoryAddress, bootstrapAddress } = getDefaultAddresses({
        validatorAddress: _validatorAddress,
        metaFactoryAddress: _metaFactoryAddress,
        bootstrapAddress: _bootstrapAddress
    });
    const generateInitCode = () => getAccountInitCode({
        owner: localOwner.address,
        index,
        validatorAddress,
        bootstrapAddress
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
            factory: metaFactoryAddress,
            factoryData: await generateInitCode()
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
        async getNonce(_args) {
            return (0, getAccountNonce_js_1.getAccountNonce)(client, {
                address: await this.getAddress(),
                entryPointAddress: entryPoint.address,
                key: (0, getNonceKey_js_1.getNonceKeyWithEncoding)(validatorAddress, parameters.nonceKey ?? 0n)
            });
        },
        async getStubSignature() {
            return constants_js_1.DUMMY_ECDSA_SIGNATURE;
        },
        async sign({ hash }) {
            return this.signMessage({ message: hash });
        },
        async signMessage({ message }) {
            let signature = await localOwner.signMessage({
                message
            });
            const potentiallyIncorrectV = Number.parseInt(signature.slice(-2), 16);
            if (![27, 28].includes(potentiallyIncorrectV)) {
                const correctV = potentiallyIncorrectV + 27;
                signature = (signature.slice(0, -2) +
                    correctV.toString(16));
            }
            return (0, viem_1.encodePacked)(["address", "bytes"], [validatorAddress, signature]);
        },
        async signTypedData(typedData) {
            let signature = await localOwner.signTypedData(typedData);
            const potentiallyIncorrectV = Number.parseInt(signature.slice(-2), 16);
            if (![27, 28].includes(potentiallyIncorrectV)) {
                const correctV = potentiallyIncorrectV + 27;
                signature = (signature.slice(0, -2) +
                    correctV.toString(16));
            }
            return (0, viem_1.encodePacked)(["address", "bytes"], [validatorAddress, signature]);
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
            const signature = await localOwner.signMessage({
                message: { raw: hash }
            });
            return signature;
        }
    });
}
//# sourceMappingURL=toEtherspotSmartAccount.js.map