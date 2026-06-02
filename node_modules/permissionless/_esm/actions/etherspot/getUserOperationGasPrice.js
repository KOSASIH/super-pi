/**
 * Returns the live gas prices that you can use to send a user operation.
 *
 * @param client that you created using viem's createClient whose transport url is pointing to the Etherspot's bundler.
 * @returns maxFeePerGas & maxPriorityFeePerGas
 */
export const getUserOperationGasPrice = async (client) => {
    const gasPrice = await client.request({
        method: "skandha_getGasPrice",
        params: []
    });
    return {
        maxFeePerGas: BigInt(gasPrice.maxFeePerGas),
        maxPriorityFeePerGas: BigInt(gasPrice.maxPriorityFeePerGas)
    };
};
//# sourceMappingURL=getUserOperationGasPrice.js.map