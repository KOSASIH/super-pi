"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCalls = sendCalls;
const account_abstraction_1 = require("viem/account-abstraction");
const utils_1 = require("viem/utils");
async function sendCalls(client, args) {
    const userOpHash = await (0, utils_1.getAction)(client, account_abstraction_1.sendUserOperation, "sendUserOperation")({ ...args });
    return { id: userOpHash };
}
//# sourceMappingURL=sendCalls.js.map