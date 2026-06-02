"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseModuleTypeId = parseModuleTypeId;
exports.supportsModule = supportsModule;
const viem_1 = require("viem");
const actions_1 = require("viem/actions");
const utils_1 = require("viem/utils");
const utils_2 = require("viem/utils");
const index_js_1 = require("../../errors/index.js");
function parseModuleTypeId(type) {
    switch (type) {
        case "validator":
            return BigInt(1);
        case "executor":
            return BigInt(2);
        case "fallback":
            return BigInt(3);
        case "hook":
            return BigInt(4);
        default:
            throw new Error("Invalid module type");
    }
}
async function supportsModule(client, args) {
    const { account: account_ = client.account } = args;
    if (!account_) {
        throw new index_js_1.AccountNotFoundError({
            docsPath: "/docs/actions/wallet/sendTransaction"
        });
    }
    const account = (0, utils_2.parseAccount)(account_);
    const publicClient = account.client;
    const abi = [
        {
            name: "supportsModule",
            type: "function",
            stateMutability: "view",
            inputs: [
                {
                    type: "uint256",
                    name: "moduleTypeId"
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
            functionName: "supportsModule",
            args: [parseModuleTypeId(args.type)],
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
                    functionName: "supportsModule",
                    args: [parseModuleTypeId(args.type)]
                })
            });
            if (!result || !result.data) {
                throw new Error("accountId result is empty");
            }
            return (0, viem_1.decodeFunctionResult)({
                abi,
                functionName: "supportsModule",
                data: result.data
            });
        }
        throw error;
    }
}
//# sourceMappingURL=supportsModule.js.map