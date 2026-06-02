import { getCallsStatus } from "../../actions/smartAccount/getCallsStatus.js";
import { sendCalls } from "../../actions/smartAccount/sendCalls.js";
import { sendTransaction } from "../../actions/smartAccount/sendTransaction.js";
import { signMessage } from "../../actions/smartAccount/signMessage.js";
import { signTypedData } from "../../actions/smartAccount/signTypedData.js";
import { writeContract } from "../../actions/smartAccount/writeContract.js";
export function smartAccountActions(client) {
    return {
        sendTransaction: (args) => sendTransaction(client, args),
        signMessage: (args) => signMessage(client, args),
        signTypedData: (args) => signTypedData(client, args),
        writeContract: (args) => writeContract(client, args),
        sendCalls: (args) => sendCalls(client, args),
        getCallsStatus: (args) => getCallsStatus(client, args)
    };
}
//# sourceMappingURL=smartAccount.js.map