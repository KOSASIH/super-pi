"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeExecutionMode = encodeExecutionMode;
exports.supportsExecutionMode = supportsExecutionMode;
const viem_1 = require("viem");
const actions_1 = require("viem/actions");
const utils_1 = require("viem/utils");
const utils_2 = require("viem/utils");
const index_js_1 = require("../../errors/index.js");
function parseCallType(callType) {
    switch (callType) {
        case "call":
            return "0x00";
        case "batchcall":
            return "0x01";
        case "delegatecall":
            return "0xff";
    }
}
function encodeExecutionMode({ type, revertOnError, selector, context }) {
    return (0, viem_1.encodePacked)(["bytes1", "bytes1", "bytes4", "bytes4", "bytes22"], [
        (0, viem_1.toHex)((0, viem_1.toBytes)(parseCallType(type), { size: 1 })),
        (0, viem_1.toHex)((0, viem_1.toBytes)(revertOnError ? "0x01" : "0x00", { size: 1 })),
        (0, viem_1.toHex)((0, viem_1.toBytes)("0x0", { size: 4 })),
        (0, viem_1.toHex)((0, viem_1.toBytes)(selector ?? "0x", { size: 4 })),
        (0, viem_1.toHex)((0, viem_1.toBytes)(context ?? "0x", { size: 22 }))
    ]);
}
async function supportsExecutionMode(client, args) {
    const { account: account_ = client.account, type, revertOnError, selector, context } = args;
    if (!account_) {
        throw new index_js_1.AccountNotFoundError({
            docsPath: "/docs/actions/wallet/sendTransaction"
        });
    }
    const account = (0, utils_2.parseAccount)(account_);
    const publicClient = account.client;
    const encodedMode = encodeExecutionMode({
        type,
        revertOnError,
        selector,
        context
    });
    const abi = [
        {
            name: "supportsExecutionMode",
            type: "function",
            stateMutability: "view",
            inputs: [
                {
                    type: "bytes32",
                    name: "encodedMode"
                }
            ],
            outputs: [
                {
                    type: "bool"
                }
            ]
        }
    ];
    try {
        return await (0, utils_1.getAction)(publicClient, actions_1.readContract, "readContract")({
            abi,
            functionName: "supportsExecutionMode",
            args: [encodedMode],
            address: account.address
        });
    }
    catch (error) {
        if (error instanceof viem_1.ContractFunctionExecutionError) {
            const { factory, factoryData } = await account.getFactoryArgs();
            const result = await (0, utils_1.getAction)(publicClient, actions_1.call, "call")({
                factory: factory,
                factoryData: factoryData,
                to: account.address,
                data: (0, viem_1.encodeFunctionData)({
                    abi,
                    functionName: "supportsExecutionMode",
                    args: [encodedMode]
                })
            });
            if (!result || !result.data) {
                throw new Error("accountId result is empty");
            }
            return (0, viem_1.decodeFunctionResult)({
                abi,
                functionName: "supportsExecutionMode",
                data: result.data
            });
        }
        throw error;
    }
}
//# sourceMappingURL=supportsExecutionMode.js.map