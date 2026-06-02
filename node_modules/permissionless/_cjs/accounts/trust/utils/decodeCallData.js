"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeCallData = void 0;
const viem_1 = require("viem");
const decodeCallData = async (callData) => {
    try {
        const decodedBatch = (0, viem_1.decodeFunctionData)({
            abi: [
                {
                    inputs: [
                        {
                            internalType: "address[]",
                            name: "dest",
                            type: "address[]"
                        },
                        {
                            internalType: "uint256[]",
                            name: "value",
                            type: "uint256[]"
                        },
                        {
                            internalType: "bytes[]",
                            name: "func",
                            type: "bytes[]"
                        }
                    ],
                    name: "executeBatch",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function"
                }
            ],
            data: callData
        });
        const calls = [];
        for (let i = 0; i < decodedBatch.args[0].length; i++) {
            calls.push({
                to: decodedBatch.args[0][i],
                value: decodedBatch.args[1][i],
                data: decodedBatch.args[2][i]
            });
        }
        return calls;
    }
    catch (_) { }
    const decodedSingle = (0, viem_1.decodeFunctionData)({
        abi: [
            {
                inputs: [
                    {
                        internalType: "address",
                        name: "dest",
                        type: "address"
                    },
                    {
                        internalType: "uint256",
                        name: "value",
                        type: "uint256"
                    },
                    {
                        internalType: "bytes",
                        name: "func",
                        type: "bytes"
                    }
                ],
                name: "execute",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function"
            }
        ],
        data: callData
    });
    return [
        {
            to: decodedSingle.args[0],
            value: decodedSingle.args[1],
            data: decodedSingle.args[2]
        }
    ];
};
exports.decodeCallData = decodeCallData;
//# sourceMappingURL=decodeCallData.js.map