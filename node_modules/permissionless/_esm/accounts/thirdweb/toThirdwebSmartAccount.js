import { getChainId } from "viem/actions";
import { getAccountNonce } from "../../actions/public/getAccountNonce.js";
import { entryPoint06Abi, entryPoint07Abi, entryPoint07Address, getUserOperationHash, toSmartAccount } from "viem/account-abstraction";
import { getAction, toHex } from "viem/utils";
import { toOwner } from "../../utils/toOwner.js";
import { decodeCallData } from "./utils/decodeCallData.js";
import { encodeCallData } from "./utils/encodeCallData.js";
import { getAccountAddress } from "./utils/getAccountAddress.js";
import { getFactoryData } from "./utils/getFactoryData.js";
import { signMessage } from "./utils/signMessage.js";
import { signTypedData } from "./utils/signTypedData.js";
/**
 * Default addresses for Thirdweb Smart Account
 */
export const THIRDWEB_ADDRESSES = {
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
/**
 * @description Creates a Thirdweb Smart Account from a private key.
 *
 * @returns A Private Key Thirdweb Smart Account.
 */
export async function toThirdwebSmartAccount(parameters) {
    const entryPoint = {
        address: parameters.entryPoint?.address ?? entryPoint07Address,
        abi: (parameters.entryPoint?.version ?? "0.7") === "0.6"
            ? entryPoint06Abi
            : entryPoint07Abi,
        version: parameters.entryPoint?.version ?? "0.7"
    };
    const { owner, client, salt, version, address, factoryAddress = THIRDWEB_ADDRESSES[entryPoint.version][version ?? "1.5.20"].factoryAddress } = parameters;
    const admin = await toOwner({ owner });
    let accountAddress = address;
    let chainId;
    const getMemoizedChainId = async () => {
        if (chainId)
            return chainId;
        chainId = client.chain
            ? client.chain.id
            : await getAction(client, getChainId, "getChainId")({});
        return chainId;
    };
    const getFactoryArgs = async () => {
        return {
            factory: factoryAddress,
            factoryData: await getFactoryData({
                admin: admin.address,
                salt: salt ? toHex(salt) : "0x"
            })
        };
    };
    return toSmartAccount({
        client,
        entryPoint,
        getFactoryArgs,
        async getAddress() {
            if (accountAddress)
                return accountAddress;
            accountAddress = await getAccountAddress(client, {
                adminAddress: admin.address,
                factoryAddress,
                salt: salt ? toHex(salt) : "0x"
            });
            return accountAddress;
        },
        async encodeCalls(calls) {
            return encodeCallData(calls);
        },
        async decodeCalls(callData) {
            return decodeCallData(callData);
        },
        async getNonce(args) {
            return getAccountNonce(client, {
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
            return signMessage({
                admin,
                chainId: await getMemoizedChainId(),
                accountAddress: await this.getAddress(),
                message
            });
        },
        async signTypedData(typedData) {
            return signTypedData({
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
                    raw: getUserOperationHash({
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