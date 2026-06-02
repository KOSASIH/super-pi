import { type Address, type Hex } from "viem";
import { type CallType, type ExecutionMode } from "../actions/erc7579/supportsExecutionMode.js";
export type EncodeCallDataParams<callType extends CallType> = {
    mode: ExecutionMode<callType>;
    callData: readonly {
        to: Address;
        value?: bigint | undefined;
        data?: Hex | undefined;
    }[];
};
export declare function encode7579Calls<callType extends CallType>({ mode, callData }: EncodeCallDataParams<callType>): Hex;
//# sourceMappingURL=encode7579Calls.d.ts.map