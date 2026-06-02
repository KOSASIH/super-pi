"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeCallData = void 0;
const viem_1 = require("viem");
const decode7579Calls_js_1 = require("../../../utils/decode7579Calls.js");
const KernelAccountAbi_js_1 = require("../abi/KernelAccountAbi.js");
const isKernelV2_js_1 = require("./isKernelV2.js");
const decodeCallData = ({ kernelVersion, callData }) => {
    if ((0, isKernelV2_js_1.isKernelV2)(kernelVersion)) {
        const decoded = (0, viem_1.decodeFunctionData)({
            abi: KernelAccountAbi_js_1.KernelExecuteAbi,
            data: callData
        });
        if (decoded.functionName === "executeBatch") {
            return decoded.args[0].map((tx) => ({
                to: tx.to,
                value: tx.value,
                data: tx.data
            }));
        }
        if (decoded.functionName === "execute") {
            const [to, value, data] = decoded.args;
            return [
                {
                    to,
                    value,
                    data
                }
            ];
        }
        throw new Error("Invalid function name");
    }
    return (0, decode7579Calls_js_1.decode7579Calls)(callData).callData;
};
exports.decodeCallData = decodeCallData;
//# sourceMappingURL=decodeCallData.js.map