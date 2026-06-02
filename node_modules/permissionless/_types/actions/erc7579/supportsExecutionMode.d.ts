import { type Chain, type Client, type Hex, type Transport } from "viem";
import type { GetSmartAccountParameter, SmartAccount } from "viem/account-abstraction";
export type CallType = "call" | "delegatecall" | "batchcall";
export type ExecutionMode<callType extends CallType> = {
    type: callType;
    revertOnError?: boolean;
    selector?: Hex;
    context?: Hex;
};
export type SupportsExecutionModeParameters<TSmartAccount extends SmartAccount | undefined, callType extends CallType = CallType> = GetSmartAccountParameter<TSmartAccount> & ExecutionMode<callType>;
export declare function encodeExecutionMode<callType extends CallType>({ type, revertOnError, selector, context }: ExecutionMode<callType>): Hex;
export declare function supportsExecutionMode<TSmartAccount extends SmartAccount | undefined, callType extends CallType = CallType>(client: Client<Transport, Chain | undefined, TSmartAccount>, args: SupportsExecutionModeParameters<TSmartAccount, callType>): Promise<boolean>;
//# sourceMappingURL=supportsExecutionMode.d.ts.map