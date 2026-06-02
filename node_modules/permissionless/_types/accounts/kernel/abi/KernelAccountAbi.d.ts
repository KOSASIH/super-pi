/**
 * The exeute abi, used to execute a transaction on the kernel smart account
 */
export declare const KernelExecuteAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }, {
        readonly internalType: "enum Operation";
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly name: "execute";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly internalType: "struct Call[]";
        readonly name: "calls";
        readonly type: "tuple[]";
    }];
    readonly name: "executeBatch";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}];
/**
 * The init abi, used to initialise kernel account
 */
export declare const KernelInitAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "contract IKernelValidator";
        readonly name: "_defaultValidator";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "_data";
        readonly type: "bytes";
    }];
    readonly name: "initialize";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}];
//# sourceMappingURL=KernelAccountAbi.d.ts.map