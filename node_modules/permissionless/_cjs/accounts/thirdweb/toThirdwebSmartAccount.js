"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.THIRDWEB_ADDRESSES = void 0;
exports.toThirdwebSmartAccount = toThirdwebSmartAccount;
const actions_1 = require("viem/actions");
const getAccountNonce_js_1 = require("../../actions/public/getAccountNonce.js");
const account_abstraction_1 = require("viem/account-abstraction");
const utils_1 = require("viem/utils");
const toOwner_js_1 = require("../../utils/toOwner.js");
const decodeCallData_js_1 = require("./utils/decodeCallData.js");
const encodeCallData_js_1 = require("./utils/encodeCallData.js");
const getAccountAddress_js_1 = require("./utils/getAccountAddress.js");
const getFactoryData_js_1 = require("./utils/getFactoryData.js");
const signMessage_js_1 = require("./utils/signMessage.js");
const signTypedData_js_1 = require("./utils/signTypedData.js");
exports.THIRDWEB_ADDRESSES = {
    "0.6": {
        "1.5.20": {
            factoryAddress: "0x85e23b94e7F5E9cC1fF78BCe78cfb15B81f0DF00"
        }
    },
    "0.7": {
        "1.5.20": {
            factoryAddress: "0x4be0ddfebca9a5a4a617dee4dece99e7c862dceb"
        }
    }
};
async function toThirdwebSmartAccount(parameters) {
    const entryPoint = {
        address: parameters.entryPoint?.address ?? account_abstraction_1.entryPoint07Address,
        abi: (parameters.entryPoint?.version ?? "0.7") === "0.6"
            ? account_abstraction_1.entryPoint06Abi
            : account_abstraction_1.entryPoint07Abi,
        version: parameters.entryPoint?.version ?? "0.7"
    };
    const { owner, client, salt, version, address, factoryAddress = exports.THIRDWEB_ADDRESSES[entryPoint.version][version ?? "1.5.20"].factoryAddress } = parameters;
    const admin = await (0, toOwner_js_1.toOwner)({ owner });
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
            factoryData: await (0, getFactoryData_js_1.getFactoryData)({
                admin: admin.address,
                salt: salt ? (0, utils_1.toHex)(salt) : "0x"
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
            accountAddress = await (0, getAccountAddress_js_1.getAccountAddress)(client, {
                adminAddress: admin.address,
                factoryAddress,
                salt: salt ? (0, utils_1.toHex)(salt) : "0x"
            });
            return accountAddress;
        },
        async encodeCalls(calls) {
            return (0, encodeCallData_js_1.encodeCallData)(calls);
        },
        async decodeCalls(callData) {
            return (0, decodeCallData_js_1.decodeCallData)(callData);
        },
        async getNonce(args) {
            return (0, getAccountNonce_js_1.getAccountNonce)(client, {
                address: await this.getAddress(),
                entryPointAddress: entryPoint.address,
                key: parameters?.nonceKey ?? args?.key
            });
        },
        async getStubSignature() {
            return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
        },
        async sign({ hash }) {
            return this.signMessage({ message: hash });
        },
        async signMessage({ message }) {
            return (0, signMessage_js_1.signMessage)({
                admin,
                chainId: await getMemoizedChainId(),
                accountAddress: await this.getAddress(),
                message
            });
        },
        async signTypedData(typedData) {
            return (0, signTypedData_js_1.signTypedData)({
                admin,
                chainId: await getMemoizedChainId(),
                accountAddress: await this.getAddress(),
                ...typedData
            });
        },
        async signUserOperation(parameters) {
            const { chainId = await getMemoizedChainId(), ...userOperation } = parameters;
            return admin.signMessage({
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
//# sourceMappingURL=toThirdwebSmartAccount.js.map