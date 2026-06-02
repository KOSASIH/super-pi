import { ContractFunctionExecutionError, decodeFunctionResult, encodeFunctionData } from "viem";
import { call, readContract } from "viem/actions";
import { getAction } from "viem/utils";
import { AccountNotFoundError } from "../../errors/index.js";
export async function accountId(client, args) {
    let account_ = client.account;
    if (args) {
        account_ = args.account;
    }
    if (!account_) {
        throw new AccountNotFoundError({
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
        return await getAction(publicClient, readContract, "readContract")({
            abi,
            functionName: "accountId",
            address: await account.getAddress()
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
                    functionName: "accountId"
                })
            });
            if (!result || !result.data) {
                throw new Error("accountId result is empty");
            }
            return decodeFunctionResult({
                abi,
                functionName: "accountId",
                data: result.data
            });
        }
        throw error;
    }
}
//# sourceMappingURL=accountId.js.map