import { encodeFunctionData, getAddress } from "viem";
import { parseModuleTypeId } from "../actions/erc7579/supportsModule.js";
import { AccountNotFoundError } from "../errors/index.js";
export function encodeInstallModule(parameters) {
    const account = parameters.account;
    if (!account) {
        throw new AccountNotFoundError({
            docsPath: "/docs/actions/wallet/sendTransaction"
        });
    }
    const modules = Array.isArray(parameters.modules)
        ? parameters.modules
        : [parameters.modules];
    return modules.map(({ type, address, context, initData }) => ({
        to: account.address,
        value: BigInt(0),
        data: encodeFunctionData({
            abi: [
                {
                    type: "function",
                    name: "installModule",
                    inputs: [
                        {
                            name: "moduleType",
                            type: "uint256",
                            internalType: "uint256"
                        },
                        {
                            name: "module",
                            type: "address",
                            internalType: "address"
                        },
                        {
                            name: "initData",
                            type: "bytes",
                            internalType: "bytes"
                        }
                    ],
                    outputs: [],
                    stateMutability: "nonpayable"
                }
            ],
            functionName: "installModule",
            args: [
                parseModuleTypeId(type),
                getAddress(address),
                context ?? initData
            ]
        })
    }));
}
//# sourceMappingURL=encodeInstallModule.js.map