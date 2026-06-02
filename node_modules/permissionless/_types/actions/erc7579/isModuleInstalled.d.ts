import { type Address, type Chain, type Client, type Hex, type OneOf, type Transport } from "viem";
import type { GetSmartAccountParameter, SmartAccount } from "viem/account-abstraction";
import { type ModuleType } from "./supportsModule.js";
export type IsModuleInstalledParameters<TSmartAccount extends SmartAccount | undefined> = GetSmartAccountParameter<TSmartAccount> & {
    type: ModuleType;
    address: Address;
} & OneOf<{
    additionalContext: Hex;
} | {
    context: Hex;
}>;
export declare function isModuleInstalled<TSmartAccount extends SmartAccount | undefined>(client: Client<Transport, Chain | undefined, TSmartAccount>, parameters: IsModuleInstalledParameters<TSmartAccount>): Promise<boolean>;
//# sourceMappingURL=isModuleInstalled.d.ts.map