"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode7579Calls = decode7579Calls;
const viem_1 = require("viem");
function decode7579Calls(callData) {
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
    const decoded = (0, viem_1.decodeFunctionData)({
        abi: executeAbi,
        data: callData
    });
    const mode = decoded.args[0];
    const executionCalldata = decoded.args[1];
    const callType = (0, viem_1.slice)(mode, 0, 1);
    const revertOnError = (0, viem_1.slice)(mode, 1, 2);
    const selector = (0, viem_1.slice)(mode, 3, 7);
    const context = (0, viem_1.slice)(mode, 7);
    let type;
    switch (BigInt(callType)) {
        case BigInt(0x00):
            type = "call";
            break;
        case BigInt(0x01):
            type = "batchcall";
            break;
        case BigInt(0xff):
            type = "delegatecall";
            break;
        default:
            throw new Error("Invalid call type");
    }
    const decodedMode = {
        type,
        revertOnError: BigInt(revertOnError) === BigInt(1),
        selector,
        context
    };
    if (decodedMode.type === "batchcall") {
        const [calls] = (0, viem_1.decodeAbiParameters)([
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
        ], executionCalldata);
        return {
            mode: decodedMode,
            callData: calls.map((call) => ({
                to: call.target,
                value: call.value,
                data: call.callData
            }))
        };
    }
    const to = (0, viem_1.getAddress)((0, viem_1.slice)(executionCalldata, 0, 20));
    const value = BigInt((0, viem_1.slice)(executionCalldata, 20, 52));
    const data = (0, viem_1.size)(executionCalldata) > 52 ? (0, viem_1.slice)(executionCalldata, 52) : "0x";
    return {
        mode: decodedMode,
        callData: [
            {
                to,
                value,
                data
            }
        ]
    };
}
//# sourceMappingURL=decode7579Calls.js.map