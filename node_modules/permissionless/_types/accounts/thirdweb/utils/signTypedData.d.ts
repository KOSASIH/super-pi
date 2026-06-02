import { type Address, type LocalAccount, type SignTypedDataReturnType, type TypedDataDefinition } from "viem";
export declare function signTypedData(parameters: TypedDataDefinition & {
    accountAddress: Address;
    chainId: number;
    admin: LocalAccount;
}): Promise<SignTypedDataReturnType>;
//# sourceMappingURL=signTypedData.d.ts.map