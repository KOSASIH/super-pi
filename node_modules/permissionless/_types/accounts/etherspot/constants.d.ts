import type { Address } from "viem";
export declare const DUMMY_ECDSA_SIGNATURE = "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
export declare const VALIDATOR_TYPE: {
    readonly ROOT: "0x00";
    readonly VALIDATOR: "0x01";
    readonly PERMISSION: "0x02";
};
export declare enum VALIDATOR_MODE {
    DEFAULT = "0x00",
    ENABLE = "0x01"
}
export type NetworkAddresses = {
    metaFactoryAddress: Address;
    bootstrapAddress: Address;
    validatorAddress: Address;
};
export declare const DEFAULT_CONTRACT_ADDRESS: NetworkAddresses;
//# sourceMappingURL=constants.d.ts.map