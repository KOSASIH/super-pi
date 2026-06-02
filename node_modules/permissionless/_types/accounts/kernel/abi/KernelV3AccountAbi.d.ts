export declare const KernelV3InitAbi: readonly [{
    readonly type: "function";
    readonly name: "initialize";
    readonly inputs: readonly [{
        readonly name: "_rootValidator";
        readonly type: "bytes21";
        readonly internalType: "ValidationId";
    }, {
        readonly name: "hook";
        readonly type: "address";
        readonly internalType: "contract IHook";
    }, {
        readonly name: "validatorData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }, {
        readonly name: "hookData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}];
export declare const KernelV3_1AccountAbi: readonly [{
    readonly type: "function";
    readonly name: "initialize";
    readonly inputs: readonly [{
        readonly name: "_rootValidator";
        readonly type: "bytes21";
        readonly internalType: "ValidationId";
    }, {
        readonly name: "hook";
        readonly type: "address";
        readonly internalType: "contract IHook";
    }, {
        readonly name: "validatorData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }, {
        readonly name: "hookData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }, {
        readonly name: "initConfig";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}];
export declare const KernelV3ExecuteAbi: readonly [{
    readonly type: "function";
    readonly name: "execute";
    readonly inputs: readonly [{
        readonly name: "execMode";
        readonly type: "bytes32";
        readonly internalType: "ExecMode";
    }, {
        readonly name: "executionCalldata";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "executeFromExecutor";
    readonly inputs: readonly [{
        readonly name: "execMode";
        readonly type: "bytes32";
        readonly internalType: "ExecMode";
    }, {
        readonly name: "executionCalldata";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [{
        readonly name: "returnData";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "executeUserOp";
    readonly inputs: readonly [{
        readonly name: "userOp";
        readonly type: "tuple";
        readonly internalType: "struct PackedUserOperation";
        readonly components: readonly [{
            readonly name: "sender";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "nonce";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "initCode";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }, {
            readonly name: "callData";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }, {
            readonly name: "accountGasLimits";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "preVerificationGas";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "gasFees";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "paymasterAndData";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }, {
            readonly name: "signature";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }];
    }, {
        readonly name: "userOpHash";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}];
export declare const KernelV3AccountAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [{
        readonly name: "_entrypoint";
        readonly type: "address";
        readonly internalType: "contract IEntryPoint";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "fallback";
    readonly stateMutability: "payable";
}, {
    readonly type: "receive";
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "accountId";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "accountImplementationId";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly stateMutability: "pure";
}, {
    readonly type: "function";
    readonly name: "currentNonce";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "eip712Domain";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "fields";
        readonly type: "bytes1";
        readonly internalType: "bytes1";
    }, {
        readonly name: "name";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "version";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "chainId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "verifyingContract";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "salt";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "extensions";
        readonly type: "uint256[]";
        readonly internalType: "uint256[]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "entrypoint";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract IEntryPoint";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "execute";
    readonly inputs: readonly [{
        readonly name: "execMode";
        readonly type: "bytes32";
        readonly internalType: "ExecMode";
    }, {
        readonly name: "executionCalldata";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "executeFromExecutor";
    readonly inputs: readonly [{
        readonly name: "execMode";
        readonly type: "bytes32";
        readonly internalType: "ExecMode";
    }, {
        readonly name: "executionCalldata";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [{
        readonly name: "returnData";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "executeUserOp";
    readonly inputs: readonly [{
        readonly name: "userOp";
        readonly type: "tuple";
        readonly internalType: "struct PackedUserOperation";
        readonly components: readonly [{
            readonly name: "sender";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "nonce";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "initCode";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }, {
            readonly name: "callData";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }, {
            readonly name: "accountGasLimits";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "preVerificationGas";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "gasFees";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "paymasterAndData";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }, {
            readonly name: "signature";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }];
    }, {
        readonly name: "userOpHash";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "executorConfig";
    readonly inputs: readonly [{
        readonly name: "executor";
        readonly type: "address";
        readonly internalType: "contract IExecutor";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly internalType: "struct ExecutorManager.ExecutorConfig";
        readonly components: readonly [{
            readonly name: "hook";
            readonly type: "address";
            readonly internalType: "contract IHook";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "initialize";
    readonly inputs: readonly [{
        readonly name: "_rootValidator";
        readonly type: "bytes21";
        readonly internalType: "ValidationId";
    }, {
        readonly name: "hook";
        readonly type: "address";
        readonly internalType: "contract IHook";
    }, {
        readonly name: "validatorData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }, {
        readonly name: "hookData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "installModule";
    readonly inputs: readonly [{
        readonly name: "moduleType";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "module";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "initData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "installValidations";
    readonly inputs: readonly [{
        readonly name: "vIds";
        readonly type: "bytes21[]";
        readonly internalType: "ValidationId[]";
    }, {
        readonly name: "configs";
        readonly type: "tuple[]";
        readonly internalType: "struct ValidationManager.ValidationConfig[]";
        readonly components: readonly [{
            readonly name: "nonce";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "hook";
            readonly type: "address";
            readonly internalType: "contract IHook";
        }];
    }, {
        readonly name: "validationData";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }, {
        readonly name: "hookData";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "invalidateNonce";
    readonly inputs: readonly [{
        readonly name: "nonce";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "isAllowedSelector";
    readonly inputs: readonly [{
        readonly name: "vId";
        readonly type: "bytes21";
        readonly internalType: "ValidationId";
    }, {
        readonly name: "selector";
        readonly type: "bytes4";
        readonly internalType: "bytes4";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "isModuleInstalled";
    readonly inputs: readonly [{
        readonly name: "moduleType";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "module";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "additionalContext";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "isValidSignature";
    readonly inputs: readonly [{
        readonly name: "hash";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "signature";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes4";
        readonly internalType: "bytes4";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "permissionConfig";
    readonly inputs: readonly [{
        readonly name: "pId";
        readonly type: "bytes4";
        readonly internalType: "PermissionId";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly internalType: "struct ValidationManager.PermissionConfig";
        readonly components: readonly [{
            readonly name: "permissionFlag";
            readonly type: "bytes2";
            readonly internalType: "PassFlag";
        }, {
            readonly name: "signer";
            readonly type: "address";
            readonly internalType: "contract ISigner";
        }, {
            readonly name: "policyData";
            readonly type: "bytes22[]";
            readonly internalType: "PolicyData[]";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "rootValidator";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes21";
        readonly internalType: "ValidationId";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "selectorConfig";
    readonly inputs: readonly [{
        readonly name: "selector";
        readonly type: "bytes4";
        readonly internalType: "bytes4";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly internalType: "struct SelectorManager.SelectorConfig";
        readonly components: readonly [{
            readonly name: "hook";
            readonly type: "address";
            readonly internalType: "contract IHook";
        }, {
            readonly name: "target";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "callType";
            readonly type: "bytes1";
            readonly internalType: "CallType";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "supportsExecutionMode";
    readonly inputs: readonly [{
        readonly name: "mode";
        readonly type: "bytes32";
        readonly internalType: "ExecMode";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "pure";
}, {
    readonly type: "function";
    readonly name: "supportsModule";
    readonly inputs: readonly [{
        readonly name: "moduleTypeId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "pure";
}, {
    readonly type: "function";
    readonly name: "uninstallModule";
    readonly inputs: readonly [{
        readonly name: "moduleType";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "module";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "deInitData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "uninstallValidation";
    readonly inputs: readonly [{
        readonly name: "vId";
        readonly type: "bytes21";
        readonly internalType: "ValidationId";
    }, {
        readonly name: "deinitData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }, {
        readonly name: "hookDeinitData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "upgradeTo";
    readonly inputs: readonly [{
        readonly name: "_newImplementation";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "validNonceFrom";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "validateUserOp";
    readonly inputs: readonly [{
        readonly name: "userOp";
        readonly type: "tuple";
        readonly internalType: "struct PackedUserOperation";
        readonly components: readonly [{
            readonly name: "sender";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "nonce";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "initCode";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }, {
            readonly name: "callData";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }, {
            readonly name: "accountGasLimits";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "preVerificationGas";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "gasFees";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "paymasterAndData";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }, {
            readonly name: "signature";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }];
    }, {
        readonly name: "userOpHash";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "missingAccountFunds";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "validationData";
        readonly type: "uint256";
        readonly internalType: "ValidationData";
    }];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "validationConfig";
    readonly inputs: readonly [{
        readonly name: "vId";
        readonly type: "bytes21";
        readonly internalType: "ValidationId";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly internalType: "struct ValidationManager.ValidationConfig";
        readonly components: readonly [{
            readonly name: "nonce";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "hook";
            readonly type: "address";
            readonly internalType: "contract IHook";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "ModuleInstalled";
    readonly inputs: readonly [{
        readonly name: "moduleTypeId";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "module";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ModuleUninstallResult";
    readonly inputs: readonly [{
        readonly name: "module";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "result";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ModuleUninstalled";
    readonly inputs: readonly [{
        readonly name: "moduleTypeId";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "module";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "NonceInvalidated";
    readonly inputs: readonly [{
        readonly name: "nonce";
        readonly type: "uint32";
        readonly indexed: false;
        readonly internalType: "uint32";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PermissionInstalled";
    readonly inputs: readonly [{
        readonly name: "permission";
        readonly type: "bytes4";
        readonly indexed: false;
        readonly internalType: "PermissionId";
    }, {
        readonly name: "nonce";
        readonly type: "uint32";
        readonly indexed: false;
        readonly internalType: "uint32";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PermissionUninstalled";
    readonly inputs: readonly [{
        readonly name: "permission";
        readonly type: "bytes4";
        readonly indexed: false;
        readonly internalType: "PermissionId";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Received";
    readonly inputs: readonly [{
        readonly name: "sender";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "RootValidatorUpdated";
    readonly inputs: readonly [{
        readonly name: "rootValidator";
        readonly type: "bytes21";
        readonly indexed: false;
        readonly internalType: "ValidationId";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SelectorSet";
    readonly inputs: readonly [{
        readonly name: "selector";
        readonly type: "bytes4";
        readonly indexed: false;
        readonly internalType: "bytes4";
    }, {
        readonly name: "vId";
        readonly type: "bytes21";
        readonly indexed: false;
        readonly internalType: "ValidationId";
    }, {
        readonly name: "allowed";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "TryExecuteUnsuccessful";
    readonly inputs: readonly [{
        readonly name: "batchExecutionindex";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "result";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Upgraded";
    readonly inputs: readonly [{
        readonly name: "implementation";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ValidatorInstalled";
    readonly inputs: readonly [{
        readonly name: "validator";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "contract IValidator";
    }, {
        readonly name: "nonce";
        readonly type: "uint32";
        readonly indexed: false;
        readonly internalType: "uint32";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ValidatorUninstalled";
    readonly inputs: readonly [{
        readonly name: "validator";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "contract IValidator";
    }];
    readonly anonymous: false;
}, {
    readonly type: "error";
    readonly name: "EnableNotApproved";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ExecutionReverted";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidCallType";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidCaller";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidExecutor";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidFallback";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidMode";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidModuleType";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidNonce";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidSelector";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidSignature";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidValidationType";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidValidator";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NonceInvalidationError";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotSupportedCallType";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "OnlyExecuteUserOp";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "PermissionDataLengthMismatch";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "PermissionNotAlllowedForSignature";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "PermissionNotAlllowedForUserOp";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "PolicyDataTooLarge";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "PolicyFailed";
    readonly inputs: readonly [{
        readonly name: "i";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "PolicySignatureOrderError";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "RootValidatorCannotBeRemoved";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "SignerPrefixNotPresent";
    readonly inputs: readonly [];
}];
//# sourceMappingURL=KernelV3AccountAbi.d.ts.map