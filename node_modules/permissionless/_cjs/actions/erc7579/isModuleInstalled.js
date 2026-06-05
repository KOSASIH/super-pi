"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isModuleInstalled = isModuleInstalled;
const viem_1 = require("viem");
const actions_1 = require("viem/actions");
const utils_1 = require("viem/utils");
const index_js_1 = require("../../errors/index.js");
const supportsModule_js_1 = require("./supportsModule.js");
async function isModuleInstalled(client, parameters) {
    const { account: account_ = client.account, address, context, additionalContext } = parameters;
    if (!account_) {
        throw new index_js_1.AccountNotFoundError({
            docsPath: "/docs/actions/wallet/sendTransaction"
        });
    }
    const account = (0, utils_1.parseAccount)(account_);
    const publicClient = account.client;
    const abi = [
        {
            type: "function",
            name: "isModuleInstalled",
            inputs: [
                {
                    name: "moduleType",
                    type: "uint256",
                    internalType: "uint256"
                },
                { name: "module", type: "address", internalType: "address" },
                {
                    name: "additionalContext",
                    type: "bytes",
                    internalType: "bytes"
                }
            ],
            outputs: [{ name: "", type: "bool", internalType: "bool" }],
            stateMutability: "view"
        }
    ];
    try {
        return await (0, utils_1.getAction)(publicClient, actions_1.readContract, "readContract")({
            abi,
            functionName: "isModuleInstalled",
            args: [
                (0, supportsModule_js_1.parseModuleTypeId)(parameters.type),
                (0, viem_1.getAddress)(address),
                context ?? additionalContext
            ],
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
                    functionName: "isModuleInstalled",
                    args: [
                        (0, supportsModule_js_1.parseModuleTypeId)(parameters.type),
                        (0, viem_1.getAddress)(address),
                        context ?? additionalContext
                    ]
                })
            });
            if (!result || !result.data) {
                throw new Error("accountId result is empty");
            }
            return (0, viem_1.decodeFunctionResult)({
                abi,
                functionName: "isModuleInstalled",
                data: result.data
            });
        }
        throw error;
    }
}
//# sourceMappingURL=isModuleInstalled.js.map