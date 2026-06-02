import { type Address, type Hex, type OneOf } from "viem";
import type { GetSmartAccountParameter, SmartAccount } from "viem/account-abstraction";
import { type ModuleType } from "../actions/erc7579/supportsModule.js";
export type EncodeInstallModuleParameter = {
    type: ModuleType;
    address: Address;
} & OneOf<{
    context: Hex;
} | {
    initData: Hex;
}>;
export type EncodeInstallModuleParameters<TSmartAccount extends SmartAccount | undefined> = GetSmartAccountParameter<TSmartAccount> & {
    modules: EncodeInstallModuleParameter[] | EncodeInstallModuleParameter;
};
export declare function encodeInstallModule<TSmartAccount extends SmartAccount | undefined>(parameters: EncodeInstallModuleParameters<TSmartAccount>): {
    readonly to: `0x${string}`;
    readonly value: bigint;
    readonly data: `0x${string}`;
}[];
//# sourceMappingURL=encodeInstallModule.d.ts.map