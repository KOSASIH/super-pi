import { createWalletClient, custom } from "viem";
import { toAccount } from "viem/accounts";
import { signTypedData } from "viem/actions";
import { getAction } from "viem/utils";
export async function toOwner({ owner, address }) {
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
            // For TS to be happy
            throw new Error("address is required");
        }
        walletClient = createWalletClient({
            account: address,
            transport: custom(owner)
        });
    }
    if (!walletClient) {
        walletClient = owner;
    }
    return toAccount({
        address: walletClient.account.address,
        async signMessage({ message }) {
            return walletClient.signMessage({ message });
        },
        async signTypedData(typedData) {
            return getAction(walletClient, signTypedData, "signTypedData")(typedData);
        },
        async signTransaction(_) {
            throw new Error("Smart account signer doesn't need to sign transactions");
        }
    });
}
//# sourceMappingURL=toOwner.js.map