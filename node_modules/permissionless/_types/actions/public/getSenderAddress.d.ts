import { type Address, BaseError, type Client, type Hex, type OneOf, type Prettify } from "viem";
export type GetSenderAddressParams = OneOf<{
    initCode: Hex;
    entryPointAddress: Address;
    factory?: never;
    factoryData?: never;
} | {
    entryPointAddress: Address;
    factory: Address;
    factoryData: Hex;
    initCode?: never;
}>;
export declare class InvalidEntryPointError extends BaseError {
    name: string;
    constructor({ cause, entryPointAddress }?: {
        cause?: BaseError;
        entryPointAddress?: Address;
    });
}
/**
 * Returns the address of the account that will be deployed with the given init code.
 *
 * - Docs: https://docs.pimlico.io/permissionless/reference/public-actions/getSenderAddress
 *
 * @param client {@link Client} that you created using viem's createPublicClient.
 * @param args {@link GetSenderAddressParams} initCode & entryPoint
 * @returns Sender's Address
 *
 * @example
 * import { createPublicClient } from "viem"
 * import { getSenderAddress } from "permissionless/actions"
 *
 * const publicClient = createPublicClient({
 *      chain: goerli,
 *      transport: http("https://goerli.infura.io/v3/your-infura-key")
 * })
 *
 * const senderAddress = await getSenderAddress(publicClient, {
 *      initCode,
 *      entryPoint
 * })
 *
 * // Return '0x7a88a206ba40b37a8c07a2b5688cf8b287318b63'
 */
export declare const getSenderAddress: (client: Client, args: Prettify<GetSenderAddressParams>) => Promise<Address>;
//# sourceMappingURL=getSenderAddress.d.ts.map