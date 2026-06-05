import { type Address, type Hex, type OneOf } from "viem";
import type { GetSmartAccountParameter, SmartAccount } from "viem/account-abstraction";
import { type ModuleType } from "../actions/erc7579/supportsModule.js";
export type EncodeUninstallModuleParameter = {
    type: ModuleType;
    address: Address;
} & OneOf<{
    context: Hex;
} | {
    deInitData: Hex;
}>;
export type EncodeUninstallModuleParameters<TSmartAccount extends SmartAccount | undefined> = GetSmartAccountParameter<TSmartAccount> & {
    modules: EncodeUninstallModuleParameter[] | EncodeUninstallModuleParameter;
};
export declare function encodeUninstallModule<TSmartAccount extends SmartAccount | undefined>(parameters: EncodeUninstallModuleParameters<TSmartAccount>): {
    to: `0x${string}`;
    value: bigint;
    data: `0x${string}`;
}[];
//# sourceMappingURL=encodeUninstallModule.d.ts.map