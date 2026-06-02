import { encodeFunctionData } from "viem";
import { getAction } from "viem/utils";
import { sendTransaction } from "./sendTransaction.js";
export async function writeContract(client, { abi, address, args, dataSuffix, functionName, ...request }) {
    const data = encodeFunctionData({
        abi,
        args,
        functionName
    });
    const hash = await getAction(client, (sendTransaction), "sendTransaction")({
        data: `${data}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
        to: address,
        ...request
    });
    return hash;
}
//# sourceMappingURL=writeContract.js.map