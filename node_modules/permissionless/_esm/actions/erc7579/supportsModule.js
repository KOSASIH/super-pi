import { ContractFunctionExecutionError, decodeFunctionResult, encodeFunctionData } from "viem";
import { call, readContract } from "viem/actions";
import { getAction } from "viem/utils";
import { parseAccount } from "viem/utils";
import { AccountNotFoundError } from "../../errors/index.js";
export function parseModuleTypeId(type) {
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
export async function supportsModule(client, args) {
    const { account: account_ = client.account } = args;
    if (!account_) {
        throw new AccountNotFoundError({
            docsPath: "/docs/actions/wallet/sendTransaction"
        });
    }
    const account = parseAccount(account_);
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
        return await getAction(publicClient, readContract, "readContract")({
            abi,
            functionName: "supportsModule",
            args: [parseModuleTypeId(args.type)],
            address: account.address
        });
    }
    catch (error) {
        if (error instanceof ContractFunctionExecutionError) {
            const { factory, factoryData } = await account.getFactoryArgs();
            const result = await getAction(publicClient, call, "call")({
                factory: factory,
                factoryData: factoryData,
                to: account.address,
                data: encodeFunctionData({
                    abi,
                    functionName: "supportsModule",
                    args: [parseModuleTypeId(args.type)]
                })
            });
            if (!result || !result.data) {
                throw new Error("accountId result is empty");
            }
            return decodeFunctionResult({
                abi,
                functionName: "supportsModule",
                data: result.data
            });
        }
        throw error;
    }
}
//# sourceMappingURL=supportsModule.js.map