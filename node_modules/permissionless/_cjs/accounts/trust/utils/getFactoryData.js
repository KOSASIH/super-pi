"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFactoryData = void 0;
const viem_1 = require("viem");
const getFactoryData = async ({ bytes, index, secp256k1VerificationFacetAddress }) => {
    return (0, viem_1.encodeFunctionData)({
        abi: [
            {
                inputs: [
                    {
                        internalType: "address",
                        name: "_verificationFacet",
                        type: "address"
                    },
                    {
                        internalType: "bytes",
                        name: "_owner",
                        type: "bytes"
                    },
                    {
                        internalType: "uint256",
                        name: "_salt",
                        type: "uint256"
                    }
                ],
                name: "createAccount",
                outputs: [
                    {
                        internalType: "contract Barz",
                        name: "barz",
                        type: "address"
                    }
                ],
                stateMutability: "nonpayable",
                type: "function"
            }
        ],
        functionName: "createAccount",
        args: [secp256k1VerificationFacetAddress, bytes, index]
    });
};
exports.getFactoryData = getFactoryData;
//# sourceMappingURL=getFactoryData.js.map