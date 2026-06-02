import { type Hex } from "viem";
import type { KernelVersion } from "../toKernelSmartAccount.js";
export declare const decodeCallData: ({ kernelVersion, callData }: {
    callData: Hex;
    kernelVersion: KernelVersion<"0.6" | "0.7">;
}) => readonly {
    to: import("viem").Address;
    value?: bigint | undefined;
    data?: Hex | undefined;
}[];
//# sourceMappingURL=decodeCallData.d.ts.map