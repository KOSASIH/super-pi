import { type Address, type LocalAccount, type SignMessageReturnType, type SignableMessage } from "viem";
export declare function signMessage({ message, admin, accountAddress, chainId }: {
    chainId: number;
    message: SignableMessage;
    admin: LocalAccount;
    accountAddress: Address;
}): Promise<SignMessageReturnType>;
//# sourceMappingURL=signMessage.d.ts.map