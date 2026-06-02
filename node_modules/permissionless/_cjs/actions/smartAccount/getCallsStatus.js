"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCallsStatus = getCallsStatus;
const account_abstraction_1 = require("viem/account-abstraction");
const actions_1 = require("viem/actions");
const utils_1 = require("viem/utils");
const getStatus = (_status) => {
    const [status, statusCode] = (() => {
        const statusCode = _status;
        if (statusCode >= 100 && statusCode < 200)
            return ["pending", statusCode];
        if (statusCode >= 200 && statusCode < 300)
            return ["success", statusCode];
        if (statusCode >= 300 && statusCode < 700)
            return ["failure", statusCode];
        if (statusCode === "CONFIRMED")
            return ["success", 200];
        if (statusCode === "PENDING")
            return ["pending", 100];
        return [undefined, statusCode];
    })();
    return [status, statusCode];
};
async function getCallsStatus(client, args) {
    const userOperationHash = args.id;
    const chainId = client.chain?.id ??
        client.account?.client.chain?.id ??
        (0, utils_1.getAction)(client, actions_1.getChainId, "getChainId")(client);
    try {
        const receipt = await (0, utils_1.getAction)(client, account_abstraction_1.getUserOperationReceipt, "getUserOperationReceipt")({
            hash: args.id
        });
        const userOpStatus = receipt.success;
        const [status, statusCode] = getStatus(userOpStatus ? 200 : 500);
        return {
            id: userOperationHash,
            version: "1.0",
            chainId: await chainId,
            status,
            statusCode,
            atomic: true,
            receipts: [
                {
                    status: receipt.receipt.status,
                    logs: receipt.receipt.logs,
                    blockHash: receipt.receipt.blockHash,
                    blockNumber: receipt.receipt.blockNumber,
                    gasUsed: receipt.receipt.gasUsed,
                    transactionHash: receipt.receipt.transactionHash
                }
            ]
        };
    }
    catch {
        const [status, statusCode] = getStatus(100);
        return {
            id: userOperationHash,
            version: "1.0",
            chainId: await chainId,
            atomic: true,
            status,
            statusCode
        };
    }
}
//# sourceMappingURL=getCallsStatus.js.map