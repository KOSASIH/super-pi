import { type Chain, type Client, type Transport } from "viem";
import type { GetSmartAccountParameter, SmartAccount } from "viem/account-abstraction";
export type ModuleType = "validator" | "executor" | "fallback" | "hook";
export type SupportsModuleParameters<TSmartAccount extends SmartAccount | undefined> = GetSmartAccountParameter<TSmartAccount> & {
    type: ModuleType;
};
export declare function parseModuleTypeId(type: ModuleType): bigint;
export declare function supportsModule<TSmartAccount extends SmartAccount | undefined>(client: Client<Transport, Chain | undefined, TSmartAccount>, args: SupportsModuleParameters<TSmartAccount>): Promise<boolean>;
//# sourceMappingURL=supportsModule.d.ts.map