"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRUST_ADDRESSES = void 0;
exports.toTrustSmartAccount = toTrustSmartAccount;
const viem_1 = require("viem");
const actions_1 = require("viem/actions");
const getAccountNonce_js_1 = require("../../actions/public/getAccountNonce.js");
const account_abstraction_1 = require("viem/account-abstraction");
const utils_1 = require("viem/utils");
const getSenderAddress_js_1 = require("../../actions/public/getSenderAddress.js");
const toOwner_js_1 = require("../../utils/toOwner.js");
const decodeCallData_js_1 = require("./utils/decodeCallData.js");
const encodeCallData_js_1 = require("./utils/encodeCallData.js");
const getFactoryData_js_1 = require("./utils/getFactoryData.js");
async function _signTypedData(signer, chainId, accountAddress, hashedMessage) {
    return signer.signTypedData({
        domain: {
            chainId: Number(chainId),
            name: "Barz",
            verifyingContract: accountAddress,
            version: "v0.2.0"
        },
        types: {
            BarzMessage: [{ name: "message", type: "bytes" }]
        },
        message: {
            message: hashedMessage
        },
        primaryType: "BarzMessage"
    });
}
exports.TRUST_ADDRESSES = {
    secp256k1VerificationFacetAddress: "0x81b9E3689390C7e74cF526594A105Dea21a8cdD5",
    factoryAddress: "0x729c310186a57833f622630a16d13f710b83272a"
};
async function toTrustSmartAccount(parameters) {
    const { owner, client, index = 0n, address, factoryAddress = exports.TRUST_ADDRESSES.factoryAddress, secp256k1VerificationFacetAddress = exports.TRUST_ADDRESSES.secp256k1VerificationFacetAddress } = parameters;
    const localOwner = await (0, toOwner_js_1.toOwner)({ owner });
    let accountAddress = address;
    const entryPoint = {
        address: parameters.entryPoint?.address ?? account_abstraction_1.entryPoint06Address,
        abi: account_abstraction_1.entryPoint06Abi,
        version: parameters.entryPoint?.version ?? "0.6"
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
    const getFactoryArgs = async () => {
        return {
            factory: factoryAddress,
            factoryData: await (0, getFactoryData_js_1.getFactoryData)({
                bytes: localOwner.address,
                secp256k1VerificationFacetAddress,
                index
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
            const { factory, factoryData } = await getFactoryArgs();
            accountAddress = await (0, getSenderAddress_js_1.getSenderAddress)(client, {
                factory,
                factoryData,
                entryPointAddress: entryPoint.address
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
            return _signTypedData(localOwner, await getMemoizedChainId(), await this.getAddress(), (0, viem_1.hashMessage)(message));
        },
        async signTypedData(typedData) {
            return _signTypedData(localOwner, await getMemoizedChainId(), await this.getAddress(), (0, viem_1.hashTypedData)(typedData));
        },
        async signUserOperation(parameters) {
            const { chainId = await getMemoizedChainId(), ...userOperation } = parameters;
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
//# sourceMappingURL=toTrustSmartAccount.js.map