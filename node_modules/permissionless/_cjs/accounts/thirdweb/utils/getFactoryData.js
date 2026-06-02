"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFactoryData = void 0;
const viem_1 = require("viem");
const getFactoryData = async ({ admin, salt }) => {
    return (0, viem_1.encodeFunctionData)({
        abi: [
            {
                inputs: [
                    {
                        internalType: "address",
                        name: "_admin",
                        type: "address"
                    },
                    {
                        internalType: "bytes",
                        name: "_salt",
                        type: "bytes"
                    }
                ],
                name: "createAccount",
                outputs: [
                    {
                        internalType: "address",
                        type: "address"
                    }
                ],
                stateMutability: "nonpayable",
                type: "function"
            }
        ],
        functionName: "createAccount",
        args: [admin, salt]
    });
};
exports.getFactoryData = getFactoryData;
//# sourceMappingURL=getFactoryData.js.map