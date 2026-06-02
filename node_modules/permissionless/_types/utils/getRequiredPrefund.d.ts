import type { EntryPointVersion, UserOperation } from "viem/account-abstraction";
export type GetRequiredPrefundReturnType<entryPointVersion extends EntryPointVersion = "0.7"> = {
    userOperation: UserOperation<entryPointVersion>;
    entryPointVersion: entryPointVersion;
};
/**
 *
 * Returns the minimum required funds in the senders's smart account to execute the user operation.
 *
 * @param arags: {userOperation} as {@link UserOperation}
 * @returns requiredPrefund as {@link bigint}
 *
 * @example
 * import { getRequiredPrefund } from "permissionless/utils"
 *
 * const requiredPrefund = getRequiredPrefund({
 *     userOperation
 * })
 */
export declare const getRequiredPrefund: <entryPointVersion extends EntryPointVersion>({ userOperation, entryPointVersion }: GetRequiredPrefundReturnType<entryPointVersion>) => bigint;
//# sourceMappingURL=getRequiredPrefund.d.ts.map