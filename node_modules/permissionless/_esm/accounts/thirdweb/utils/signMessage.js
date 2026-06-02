import { hashMessage } from "viem";
import { signMessage as _signMessage } from "viem/actions";
export async function signMessage({ message, admin, accountAddress, chainId }) {
    const hashedMessage = hashMessage(message);
    return admin.signTypedData({
        domain: {
            name: "Account",
            version: "1",
            chainId,
            verifyingContract: accountAddress
        },
        primaryType: "AccountMessage",
        types: { AccountMessage: [{ name: "message", type: "bytes" }] },
        message: { message: hashedMessage }
    });
}
//# sourceMappingURL=signMessage.js.map