import { encodeFunctionData } from "viem";
import { encode7579Calls } from "../../../utils/encode7579Calls.js";
import { KernelExecuteAbi } from "../abi/KernelAccountAbi.js";
import { isKernelV2 } from "./isKernelV2.js";
export const encodeCallData = ({ kernelVersion, calls }) => {
    if (isKernelV2(kernelVersion)) {
        if (calls.length > 1) {
            // Encode a batched call
            return encodeFunctionData({
                abi: KernelExecuteAbi,
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
        // Encode a simple call
        return encodeFunctionData({
            abi: KernelExecuteAbi,
            functionName: "execute",
            args: [call.to, call.value ?? 0n, call.data ?? "0x", 0]
        });
    }
    return encode7579Calls({
        mode: {
            type: calls.length > 1 ? "batchcall" : "call",
            revertOnError: false,
            selector: "0x",
            context: "0x"
        },
        callData: calls
    });
};
//# sourceMappingURL=encodeCallData.js.map