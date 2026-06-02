"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeInstallModule = encodeInstallModule;
const viem_1 = require("viem");
const supportsModule_js_1 = require("../actions/erc7579/supportsModule.js");
const index_js_1 = require("../errors/index.js");
function encodeInstallModule(parameters) {
    const account = parameters.account;
    if (!account) {
        throw new index_js_1.AccountNotFoundError({
            docsPath: "/docs/actions/wallet/sendTransaction"
        });
    }
    const modules = Array.isArray(parameters.modules)
        ? parameters.modules
        : [parameters.modules];
    return modules.map(({ type, address, context, initData }) => ({
        to: account.address,
        value: BigInt(0),
        data: (0, viem_1.encodeFunctionData)({
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
                (0, supportsModule_js_1.parseModuleTypeId)(type),
                (0, viem_1.getAddress)(address),
                context ?? initData
            ]
        })
    }));
}
//# sourceMappingURL=encodeInstallModule.js.map