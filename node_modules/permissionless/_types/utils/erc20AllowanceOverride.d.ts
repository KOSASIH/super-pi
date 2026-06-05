import { type Address, type StateOverride } from "viem";
export type Erc20AllowanceOverrideParameters = {
    token: Address;
    owner: Address;
    spender: Address;
    slot: bigint;
    amount?: bigint;
};
export declare function erc20AllowanceOverride({ token, owner, spender, slot, amount }: Erc20AllowanceOverrideParameters): StateOverride;
//# sourceMappingURL=erc20AllowanceOverride.d.ts.map