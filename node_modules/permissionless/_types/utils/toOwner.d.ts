import { type Account, type Address, type Chain, type EIP1193Provider, type LocalAccount, type OneOf, type Transport, type WalletClient } from "viem";
export type EthereumProvider = OneOf<{
    request(...args: any): Promise<any>;
} | EIP1193Provider>;
export declare function toOwner<provider extends EthereumProvider>({ owner, address }: {
    owner: OneOf<provider | WalletClient<Transport, Chain | undefined, Account> | LocalAccount>;
    address?: Address;
}): Promise<LocalAccount>;
//# sourceMappingURL=toOwner.d.ts.map