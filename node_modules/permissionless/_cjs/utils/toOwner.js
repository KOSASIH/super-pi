"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toOwner = toOwner;
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const actions_1 = require("viem/actions");
const utils_1 = require("viem/utils");
async function toOwner({ owner, address }) {
    if ("type" in owner && owner.type === "local") {
        return owner;
    }
    let walletClient = undefined;
    if ("request" in owner) {
        if (!address) {
            try {
                ;
                [address] = await owner.request({
                    method: "eth_requestAccounts"
                });
            }
            catch {
                ;
                [address] = await owner.request({
                    method: "eth_accounts"
                });
            }
        }
        if (!address) {
            throw new Error("address is required");
        }
        walletClient = (0, viem_1.createWalletClient)({
            account: address,
            transport: (0, viem_1.custom)(owner)
        });
    }
    if (!walletClient) {
        walletClient = owner;
    }
    return (0, accounts_1.toAccount)({
        address: walletClient.account.address,
        async signMessage({ message }) {
            return walletClient.signMessage({ message });
        },
        async signTypedData(typedData) {
            return (0, utils_1.getAction)(walletClient, actions_1.signTypedData, "signTypedData")(typedData);
        },
        async signTransaction(_) {
            throw new Error("Smart account signer doesn't need to sign transactions");
        }
    });
}
//# sourceMappingURL=toOwner.js.map