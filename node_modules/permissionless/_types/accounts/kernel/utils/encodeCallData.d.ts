import { type Address, type Hex } from "viem";
import type { KernelVersion } from "../toKernelSmartAccount.js";
export declare const encodeCallData: ({ kernelVersion, calls }: {
    calls: readonly {
        to: Address;
        value?: bigint | undefined;
        data?: Hex | undefined;
    }[];
    kernelVersion: KernelVersion<"0.6" | "0.7">;
}) => `0x${string}`;
//# sourceMappingURL=encodeCallData.d.ts.map