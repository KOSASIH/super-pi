"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBiconomySmartAccount = toBiconomySmartAccount;
const viem_1 = require("viem");
const account_abstraction_1 = require("viem/account-abstraction");
const actions_1 = require("viem/actions");
const getAccountNonce_js_1 = require("../../actions/public/getAccountNonce.js");
const toOwner_js_1 = require("../../utils/toOwner.js");
const BiconomySmartAccountAbi_js_1 = require("./abi/BiconomySmartAccountAbi.js");
const BICONOMY_PROXY_CREATION_CODE = "0x6080346100aa57601f61012038819003918201601f19168301916001600160401b038311848410176100af578084926020946040528339810103126100aa57516001600160a01b0381168082036100aa5715610065573055604051605a90816100c68239f35b60405162461bcd60e51b815260206004820152601e60248201527f496e76616c696420696d706c656d656e746174696f6e206164647265737300006044820152606490fd5b600080fd5b634e487b7160e01b600052604160045260246000fdfe608060405230546000808092368280378136915af43d82803e156020573d90f35b3d90fdfea2646970667358221220a03b18dce0be0b4c9afe58a9eb85c35205e2cf087da098bbf1d23945bf89496064736f6c63430008110033";
const BICONOMY_ADDRESSES = {
    ECDSA_OWNERSHIP_REGISTRY_MODULE: "0x0000001c5b32F37F5beA87BDD5374eB2aC54eA8e",
    FACTORY_ADDRESS: "0x000000a56Aaca3e9a4C479ea6b6CD0DbcB6634F5",
    ACCOUNT_V2_0_LOGIC: "0x0000002512019Dafb59528B82CB92D3c5D2423aC",
    DEFAULT_FALLBACK_HANDLER_ADDRESS: "0x0bBa6d96BD616BedC6BFaa341742FD43c60b83C1"
};
const getAccountInitCode = async ({ owner, index, ecdsaModuleAddress }) => {
    if (!owner)
        throw new Error("Owner account not found");
    const ecdsaOwnershipInitData = (0, viem_1.encodeFunctionData)({
        abi: BiconomySmartAccountAbi_js_1.BiconomyAbi,
        functionName: "initForSmartAccount",
        args: [owner]
    });
    return (0, viem_1.encodeFunctionData)({
        abi: BiconomySmartAccountAbi_js_1.FactoryAbi,
        functionName: "deployCounterFactualAccount",
        args: [ecdsaModuleAddress, ecdsaOwnershipInitData, index]
    });
};
const getAccountAddress = async ({ factoryAddress, accountLogicAddress, fallbackHandlerAddress, ecdsaModuleAddress, owner, index = BigInt(0) }) => {
    const ecdsaOwnershipInitData = (0, viem_1.encodeFunctionData)({
        abi: BiconomySmartAccountAbi_js_1.BiconomyAbi,
        functionName: "initForSmartAccount",
        args: [owner]
    });
    const initialisationData = (0, viem_1.encodeFunctionData)({
        abi: BiconomySmartAccountAbi_js_1.BiconomyAbi,
        functionName: "init",
        args: [
            fallbackHandlerAddress,
            ecdsaModuleAddress,
            ecdsaOwnershipInitData
        ]
    });
    const deploymentCode = (0, viem_1.encodePacked)(["bytes", "uint256"], [BICONOMY_PROXY_CREATION_CODE, (0, viem_1.hexToBigInt)(accountLogicAddress)]);
    const salt = (0, viem_1.keccak256)((0, viem_1.encodePacked)(["bytes32", "uint256"], [(0, viem_1.keccak256)((0, viem_1.encodePacked)(["bytes"], [initialisationData])), index]));
    return (0, viem_1.getContractAddress)({
        from: factoryAddress,
        salt,
        bytecode: deploymentCode,
        opcode: "CREATE2"
    });
};
async function toBiconomySmartAccount(parameters) {
    const { owners, client, index = 0n, address, accountLogicAddress = BICONOMY_ADDRESSES.ACCOUNT_V2_0_LOGIC, fallbackHandlerAddress = BICONOMY_ADDRESSES.DEFAULT_FALLBACK_HANDLER_ADDRESS, ecdsaModuleAddress = BICONOMY_ADDRESSES.ECDSA_OWNERSHIP_REGISTRY_MODULE, factoryAddress = BICONOMY_ADDRESSES.FACTORY_ADDRESS } = parameters;
    const localOwner = await (0, toOwner_js_1.toOwner)({ owner: owners[0] });
    const entryPoint = {
        address: parameters.entryPoint?.address ?? account_abstraction_1.entryPoint06Address,
        abi: account_abstraction_1.entryPoint06Abi,
        version: parameters.entryPoint?.version ?? "0.6"
    };
    let accountAddress = address;
    const getFactoryArgs = async () => {
        return {
            factory: factoryAddress,
            factoryData: await getAccountInitCode({
                owner: localOwner.address,
                index,
                ecdsaModuleAddress
            })
        };
    };
    return (0, account_abstraction_1.toSmartAccount)({
        client,
        entryPoint,
        getFactoryArgs,
        async getAddress() {
            if (accountAddress)
                return accountAddress;
            accountAddress = await getAccountAddress({
                owner: localOwner.address,
                ecdsaModuleAddress,
                factoryAddress,
                accountLogicAddress,
                fallbackHandlerAddress,
                index
            });
            return accountAddress;
        },
        async getNonce(args) {
            const address = await this.getAddress();
            return (0, getAccountNonce_js_1.getAccountNonce)(client, {
                address,
                entryPointAddress: entryPoint.address,
                key: parameters?.nonceKey ?? args?.key
            });
        },
        encodeCalls: async (calls) => {
            if (calls.length > 1) {
                return (0, viem_1.encodeFunctionData)({
                    abi: BiconomySmartAccountAbi_js_1.BiconomyAbi,
                    functionName: "executeBatch_y6U",
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
                abi: BiconomySmartAccountAbi_js_1.BiconomyAbi,
                functionName: "execute_ncC",
                args: [call.to, call.value ?? 0n, call.data ?? "0x"]
            });
        },
        decodeCalls: async (data) => {
            const decoded = (0, viem_1.decodeFunctionData)({
                abi: BiconomySmartAccountAbi_js_1.BiconomyAbi,
                data
            });
            if (decoded.functionName === "execute_ncC") {
                return [
                    {
                        to: decoded.args[0],
                        value: decoded.args[1],
                        data: decoded.args[2]
                    }
                ];
            }
            if (decoded.functionName === "executeBatch_y6U") {
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
        },
        async getStubSignature() {
            const dynamicPart = ecdsaModuleAddress.substring(2).padEnd(40, "0");
            return `0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000${dynamicPart}000000000000000000000000000000000000000000000000000000000000004181d4b4981670cb18f99f0b4a66446df1bf5b204d24cfcb659bf38ba27a4359b5711649ec2423c5e1247245eba2964679b6a1dbb85c992ae40b9b00c6935b02ff1b00000000000000000000000000000000000000000000000000000000000000`;
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
            return (0, viem_1.encodeAbiParameters)([{ type: "bytes" }, { type: "address" }], [signature, ecdsaModuleAddress]);
        },
        async signTypedData(typedData) {
            let signature = await localOwner.signTypedData(typedData);
            const potentiallyIncorrectV = Number.parseInt(signature.slice(-2), 16);
            if (![27, 28].includes(potentiallyIncorrectV)) {
                const correctV = potentiallyIncorrectV + 27;
                signature = (signature.slice(0, -2) +
                    correctV.toString(16));
            }
            return (0, viem_1.encodeAbiParameters)([{ type: "bytes" }, { type: "address" }], [signature, ecdsaModuleAddress]);
        },
        async signUserOperation(parameters) {
            const { chainId = client.chain?.id, ...userOperation } = parameters;
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
            const signature = await (0, actions_1.signMessage)(client, {
                account: localOwner,
                message: { raw: hash }
            });
            const signatureWithModuleAddress = (0, viem_1.encodeAbiParameters)((0, viem_1.parseAbiParameters)("bytes, address"), [signature, ecdsaModuleAddress]);
            return signatureWithModuleAddress;
        }
    });
}
//# sourceMappingURL=toBiconomySmartAccount.js.map