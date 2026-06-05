import type { Address, Client, Hex } from "viem";
export type GetAccountAddressParams = {
    adminAddress: Address;
    factoryAddress: Address;
    salt: Hex;
};
export declare const getAccountAddress: (client: Client, args: GetAccountAddressParams) => Promise<Address>;
//# sourceMappingURL=getAccountAddress.d.ts.map