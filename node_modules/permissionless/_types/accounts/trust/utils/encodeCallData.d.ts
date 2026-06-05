import { type Address, type Hex } from "viem";
export declare const encodeCallData: (calls: readonly {
    to: Address;
    value?: bigint | undefined;
    data?: Hex | undefined;
}[]) => Promise<`0x${string}`>;
//# sourceMappingURL=encodeCallData.d.ts.map