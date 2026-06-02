"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeContract = writeContract;
const viem_1 = require("viem");
const utils_1 = require("viem/utils");
const sendTransaction_js_1 = require("./sendTransaction.js");
async function writeContract(client, { abi, address, args, dataSuffix, functionName, ...request }) {
    const data = (0, viem_1.encodeFunctionData)({
        abi,
        args,
        functionName
    });
    const hash = await (0, utils_1.getAction)(client, (sendTransaction_js_1.sendTransaction), "sendTransaction")({
        data: `${data}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
        to: address,
        ...request
    });
    return hash;
}
//# sourceMappingURL=writeContract.js.map