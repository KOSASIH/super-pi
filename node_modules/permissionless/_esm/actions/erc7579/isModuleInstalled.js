import { ContractFunctionExecutionError, decodeFunctionResult, encodeFunctionData, getAddress } from "viem";
import { call, readContract } from "viem/actions";
import { getAction, parseAccount } from "viem/utils";
import { AccountNotFoundError } from "../../errors/index.js";
import { parseModuleTypeId } from "./supportsModule.js";
export async function isModuleInstalled(client, parameters) {
    const { account: account_ = client.account, address, context, additionalContext } = parameters;
    if (!account_) {
        throw new AccountNotFoundError({
            docsPath: "/docs/actions/wallet/sendTransaction"
        });
    }
    const account = parseAccount(account_);
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
        return await getAction(publicClient, readContract, "readContract")({
            abi,
            functionName: "isModuleInstalled",
            args: [
                parseModuleTypeId(parameters.type),
                getAddress(address),
                context ?? additionalContext
            ],
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
                    functionName: "isModuleInstalled",
                    args: [
                        parseModuleTypeId(parameters.type),
                        getAddress(address),
                        context ?? additionalContext
                    ]
                })
            });
            if (!result || !result.data) {
                throw new Error("accountId result is empty");
            }
            return decodeFunctionResult({
                abi,
                functionName: "isModuleInstalled",
                data: result.data
            });
        }
        throw error;
    }
}
//# sourceMappingURL=isModuleInstalled.js.map