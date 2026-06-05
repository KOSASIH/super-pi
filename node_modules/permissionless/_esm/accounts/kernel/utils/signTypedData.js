import { getTypesForEIP712Domain, hashTypedData, validateTypedData } from "viem";
import { isWebAuthnAccount } from "./isWebAuthnAccount.js";
import { signMessage } from "./signMessage.js";
import { wrapMessageHash } from "./wrapMessageHash.js";
export async function signTypedData(parameters) {
    const { owner, accountAddress, kernelVersion: accountVersion, chainId, eip7702, ...typedData } = parameters;
    if ((accountVersion === "0.2.1" || accountVersion === "0.2.2") &&
        !isWebAuthnAccount(owner)) {
        return owner.signTypedData({
            ...typedData
        });
    }
    const { message, primaryType, types: _types, domain } = typedData;
    const types = {
        EIP712Domain: getTypesForEIP712Domain({
            domain: domain
        }),
        ..._types
    };
    // Need to do a runtime validation check on addresses, byte ranges, integer ranges, etc
    // as we can't statically check this with TypeScript.
    validateTypedData({
        domain,
        message,
        primaryType,
        types
    });
    const typedHash = hashTypedData({ message, primaryType, types, domain });
    if (eip7702 && !isWebAuthnAccount(owner)) {
        return owner.signTypedData({
            message: { hash: typedHash },
            primaryType: "Kernel",
            types: {
                Kernel: [{ name: "hash", type: "bytes32" }]
            },
            domain: {
                name: "Kernel",
                version: accountVersion,
                chainId: chainId,
                verifyingContract: accountAddress
            }
        });
    }
    const wrappedMessageHash = wrapMessageHash(typedHash, {
        kernelVersion: accountVersion,
        accountAddress,
        chainId: chainId
    });
    if (isWebAuthnAccount(owner)) {
        return signMessage({
            message: { raw: wrappedMessageHash },
            owner,
            accountAddress,
            kernelVersion: accountVersion,
            chainId,
            eip7702: false
        });
    }
    return owner.signMessage({
        message: { raw: wrappedMessageHash }
    });
}
//# sourceMappingURL=signTypedData.js.map