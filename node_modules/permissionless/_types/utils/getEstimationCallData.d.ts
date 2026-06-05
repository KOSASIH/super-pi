import { type Address, type Hex } from "viem";
import { type EntryPointVersion, type UserOperation } from "viem/account-abstraction";
export type GetPimlicoEstimationCallDataParams<entryPointVersion extends EntryPointVersion> = {
    userOperation: UserOperation<entryPointVersion>;
    entrypoint: {
        address: Address;
        version: entryPointVersion;
    };
} & (entryPointVersion extends "0.6" ? {
    estimationAddress: never;
} : {
    estimationAddress?: Address;
});
export declare function getPimlicoEstimationCallData<entryPointVersion extends EntryPointVersion>(args: GetPimlicoEstimationCallDataParams<entryPointVersion>): {
    to: Address;
    data: Hex;
};
//# sourceMappingURL=getEstimationCallData.d.ts.map