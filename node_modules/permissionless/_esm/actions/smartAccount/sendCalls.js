import { sendUserOperation } from "viem/account-abstraction";
import { getAction } from "viem/utils";
export async function sendCalls(client, args) {
    const userOpHash = await getAction(client, sendUserOperation, "sendUserOperation")({ ...args });
    return { id: userOpHash };
}
//# sourceMappingURL=sendCalls.js.map