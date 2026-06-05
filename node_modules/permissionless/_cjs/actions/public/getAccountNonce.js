"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountNonce = void 0;
const actions_1 = require("viem/actions");
const utils_1 = require("viem/utils");
const getAccountNonce = async (client, args) => {
    const { address, entryPointAddress, key = BigInt(0) } = args;
    return await (0, utils_1.getAction)(client, actions_1.readContract, "readContract")({
        address: entryPointAddress,
        abi: [
            {
                inputs: [
                    {
                        name: "sender",
                        type: "address"
                    },
                    {
                        name: "key",
                        type: "uint192"
                    }
                ],
                name: "getNonce",
                outputs: [
                    {
                        name: "nonce",
                        type: "uint256"
                    }
                ],
                stateMutability: "view",
                type: "function"
            }
        ],
        functionName: "getNonce",
        args: [address, key]
    });
};
exports.getAccountNonce = getAccountNonce;
//# sourceMappingURL=getAccountNonce.js.map