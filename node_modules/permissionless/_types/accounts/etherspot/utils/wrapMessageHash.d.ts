import { type Hex } from "viem";
import { type Address } from "viem";
export type WrapMessageHashParams = {
    accountAddress: Address;
    chainId: number;
};
export declare const wrapMessageHash: (messageHash: Hex, { accountAddress, chainId }: WrapMessageHashParams) => `0x${string}`;
//# sourceMappingURL=wrapMessageHash.d.ts.map