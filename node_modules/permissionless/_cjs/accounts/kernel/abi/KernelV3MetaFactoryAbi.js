"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KernelV3MetaFactoryDeployWithFactoryAbi = void 0;
exports.KernelV3MetaFactoryDeployWithFactoryAbi = [
    {
        type: "function",
        name: "deployWithFactory",
        inputs: [
            {
                name: "factory",
                type: "address",
                internalType: "contract KernelFactory"
            },
            { name: "createData", type: "bytes", internalType: "bytes" },
            { name: "salt", type: "bytes32", internalType: "bytes32" }
        ],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "payable"
    }
];
//# sourceMappingURL=KernelV3MetaFactoryAbi.js.map