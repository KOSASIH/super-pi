"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCallData = void 0;
const viem_1 = require("viem");
const encode7579Calls_js_1 = require("../../../utils/encode7579Calls.js");
const KernelAccountAbi_js_1 = require("../abi/KernelAccountAbi.js");
const isKernelV2_js_1 = require("./isKernelV2.js");
const encodeCallData = ({ kernelVersion, calls }) => {
    if ((0, isKernelV2_js_1.isKernelV2)(kernelVersion)) {
        if (calls.length > 1) {
            return (0, viem_1.encodeFunctionData)({
                abi: KernelAccountAbi_js_1.KernelExecuteAbi,
                functionName: "executeBatch",
                args: [
                    calls.map((tx) => ({
                        to: tx.to,
                        value: tx.value ?? 0n,
                        data: tx.data ?? "0x"
                    }))
                ]
            });
        }
        const call = calls.length === 0 ? undefined : calls[0];
        if (!call) {
            throw new Error("No calls to encode");
        }
        return (0, viem_1.encodeFunctionData)({
            abi: KernelAccountAbi_js_1.KernelExecuteAbi,
            functionName: "execute",
            args: [call.to, call.value ?? 0n, call.data ?? "0x", 0]
        });
    }
    return (0, encode7579Calls_js_1.encode7579Calls)({
        mode: {
            type: calls.length > 1 ? "batchcall" : "call",
            revertOnError: false,
            selector: "0x",
            context: "0x"
        },
        callData: calls
    });
};
exports.encodeCallData = encodeCallData;
//# sourceMappingURL=encodeCallData.js.map