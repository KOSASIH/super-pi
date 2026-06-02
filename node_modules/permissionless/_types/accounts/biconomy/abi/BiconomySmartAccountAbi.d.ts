export declare const FactoryAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "moduleSetupContract";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "moduleSetupData";
        readonly type: "bytes";
    }, {
        readonly internalType: "uint256";
        readonly name: "index";
        readonly type: "uint256";
    }];
    readonly name: "deployCounterFactualAccount";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "proxy";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
export declare const BiconomyAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "handler";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "moduleSetupContract";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "moduleSetupData";
        readonly type: "bytes";
    }];
    readonly name: "init";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "eoaOwner";
        readonly type: "address";
    }];
    readonly name: "initForSmartAccount";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "dest";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "func";
        readonly type: "bytes";
    }];
    readonly name: "execute_ncC";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "dest";
        readonly type: "address[]";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "value";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "bytes[]";
        readonly name: "func";
        readonly type: "bytes[]";
    }];
    readonly name: "executeBatch_y6U";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
//# sourceMappingURL=BiconomySmartAccountAbi.d.ts.map