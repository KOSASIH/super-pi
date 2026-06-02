"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode7579Calls = encode7579Calls;
const viem_1 = require("viem");
const supportsExecutionMode_js_1 = require("../actions/erc7579/supportsExecutionMode.js");
function encode7579Calls({ mode, callData }) {
    if (callData.length > 1 && mode?.type !== "batchcall") {
        throw new Error(`mode ${JSON.stringify(mode)} does not supported for batchcall calldata`);
    }
    const executeAbi = [
        {
            type: "function",
            name: "execute",
            inputs: [
                {
                    name: "execMode",
                    type: "bytes32",
                    internalType: "ExecMode"
                },
                {
                    name: "executionCalldata",
                    type: "bytes",
                    internalType: "bytes"
                }
            ],
            outputs: [],
            stateMutability: "payable"
        }
    ];
    if (callData.length > 1) {
        return (0, viem_1.encodeFunctionData)({
            abi: executeAbi,
            functionName: "execute",
            args: [
                (0, supportsExecutionMode_js_1.encodeExecutionMode)(mode),
                (0, viem_1.encodeAbiParameters)([
                    {
                        name: "executionBatch",
                        type: "tuple[]",
                        components: [
                            {
                                name: "target",
                                type: "address"
                            },
                            {
                                name: "value",
                                type: "uint256"
                            },
                            {
                                name: "callData",
                                type: "bytes"
                            }
                        ]
                    }
                ], [
                    callData.map((arg) => {
                        return {
                            target: arg.to,
                            value: arg.value ?? 0n,
                            callData: arg.data ?? "0x"
                        };
                    })
                ])
            ]
        });
    }
    const call = callData.length === 0 ? undefined : callData[0];
    if (!call) {
        throw new Error("No calls to encode");
    }
    return (0, viem_1.encodeFunctionData)({
        abi: executeAbi,
        functionName: "execute",
        args: [
            (0, supportsExecutionMode_js_1.encodeExecutionMode)(mode),
            (0, viem_1.concatHex)([
                call.to,
                (0, viem_1.toHex)(call.value ?? 0n, { size: 32 }),
                call.data ?? "0x"
            ])
        ]
    });
}
//# sourceMappingURL=encode7579Calls.js.map