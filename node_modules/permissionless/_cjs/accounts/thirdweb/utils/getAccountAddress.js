"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountAddress = void 0;
const actions_1 = require("viem/actions");
const utils_1 = require("viem/utils");
const getAccountAddress = async (client, args) => {
    const { adminAddress, factoryAddress, salt } = args;
    return (0, utils_1.getAction)(client, actions_1.readContract, "readContract")({
        address: factoryAddress,
        abi: [
            {
                inputs: [
                    {
                        name: "_adminSigner",
                        type: "address"
                    },
                    {
                        name: "_data",
                        type: "bytes"
                    }
                ],
                name: "getAddress",
                outputs: [
                    {
                        type: "address"
                    }
                ],
                stateMutability: "view",
                type: "function"
            }
        ],
        functionName: "getAddress",
        args: [adminAddress, salt]
    });
};
exports.getAccountAddress = getAccountAddress;
//# sourceMappingURL=getAccountAddress.js.map