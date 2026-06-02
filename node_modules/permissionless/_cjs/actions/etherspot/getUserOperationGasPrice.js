"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOperationGasPrice = void 0;
const getUserOperationGasPrice = async (client) => {
    const gasPrice = await client.request({
        method: "skandha_getGasPrice",
        params: []
    });
    return {
        maxFeePerGas: BigInt(gasPrice.maxFeePerGas),
        maxPriorityFeePerGas: BigInt(gasPrice.maxPriorityFeePerGas)
    };
};
exports.getUserOperationGasPrice = getUserOperationGasPrice;
//# sourceMappingURL=getUserOperationGasPrice.js.map