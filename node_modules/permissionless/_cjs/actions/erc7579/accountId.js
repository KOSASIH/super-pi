"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountId = accountId;
const viem_1 = require("viem");
const actions_1 = require("viem/actions");
const utils_1 = require("viem/utils");
const index_js_1 = require("../../errors/index.js");
async function accountId(client, args) {
    let account_ = client.account;
    if (args) {
        account_ = args.account;
    }
    if (!account_) {
        throw new index_js_1.AccountNotFoundError({
            docsPath: "/docs/actions/wallet/sendTransaction"
        });
    }
    const account = account_;
    const publicClient = account.client;
    const abi = [
        {
            name: "accountId",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [
                {
                    type: "string",
                    name: "accountImplementationId"
                }
            ]
        }
    ];
    try {
        return await (0, utils_1.getAction)(publicClient, actions_1.readContract, "readContract")({
            abi,
            functionName: "accountId",
            address: await account.getAddress()
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
                    functionName: "accountId"
                })
            });
            if (!result || !result.data) {
                throw new Error("accountId result is empty");
            }
            return (0, viem_1.decodeFunctionResult)({
                abi,
                functionName: "accountId",
                data: result.data
            });
        }
        throw error;
    }
}
//# sourceMappingURL=accountId.js.map