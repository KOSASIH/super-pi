import { type Address, type Hex } from "viem";
import type { CallType, ExecutionMode } from "../actions/erc7579/supportsExecutionMode.js";
export type DecodeCallDataReturnType = {
    mode: ExecutionMode<CallType>;
    callData: readonly {
        to: Address;
        value?: bigint | undefined;
        data?: Hex | undefined;
    }[];
};
export declare function decode7579Calls(callData: Hex): DecodeCallDataReturnType;
//# sourceMappingURL=decode7579Calls.d.ts.map