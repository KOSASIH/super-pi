import { concatHex, encodeAbiParameters, encodeFunctionData, toHex } from "viem";
import { encodeExecutionMode } from "../actions/erc7579/supportsExecutionMode.js";
export function encode7579Calls({ mode, callData }) {
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
        return encodeFunctionData({
            abi: executeAbi,
            functionName: "execute",
            args: [
                encodeExecutionMode(mode),
                encodeAbiParameters([
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
    return encodeFunctionData({
        abi: executeAbi,
        functionName: "execute",
        args: [
            encodeExecutionMode(mode),
            concatHex([
                call.to,
                toHex(call.value ?? 0n, { size: 32 }),
                call.data ?? "0x"
            ])
        ]
    });
}
//# sourceMappingURL=encode7579Calls.js.map