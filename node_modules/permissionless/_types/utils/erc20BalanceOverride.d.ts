import { type Address, type StateOverride } from "viem";
export type Erc20BalanceOverrideParameters = {
    token: Address;
    owner: Address;
    slot: bigint;
    balance?: bigint;
};
export declare function erc20BalanceOverride({ token, owner, slot, balance }: Erc20BalanceOverrideParameters): StateOverride;
//# sourceMappingURL=erc20BalanceOverride.d.ts.map