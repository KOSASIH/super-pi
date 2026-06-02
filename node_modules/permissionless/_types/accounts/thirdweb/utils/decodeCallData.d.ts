import { type Address, type Hex } from "viem";
export declare const decodeCallData: (callData: `0x${string}`) => Promise<{
    to: Address;
    data: Hex;
    value?: bigint;
}[]>;
//# sourceMappingURL=decodeCallData.d.ts.map