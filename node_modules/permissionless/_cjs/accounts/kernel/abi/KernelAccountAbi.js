"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KernelInitAbi = exports.KernelExecuteAbi = void 0;
exports.KernelExecuteAbi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "value",
                type: "uint256"
            },
            {
                internalType: "bytes",
                name: "data",
                type: "bytes"
            },
            {
                internalType: "enum Operation",
                name: "",
                type: "uint8"
            }
        ],
        name: "execute",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "to",
                        type: "address"
                    },
                    {
                        internalType: "uint256",
                        name: "value",
                        type: "uint256"
                    },
                    {
                        internalType: "bytes",
                        name: "data",
                        type: "bytes"
                    }
                ],
                internalType: "struct Call[]",
                name: "calls",
                type: "tuple[]"
            }
        ],
        name: "executeBatch",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    }
];
exports.KernelInitAbi = [
    {
        inputs: [
            {
                internalType: "contract IKernelValidator",
                name: "_defaultValidator",
                type: "address"
            },
            {
                internalType: "bytes",
                name: "_data",
                type: "bytes"
            }
        ],
        name: "initialize",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    }
];
//# sourceMappingURL=KernelAccountAbi.js.map