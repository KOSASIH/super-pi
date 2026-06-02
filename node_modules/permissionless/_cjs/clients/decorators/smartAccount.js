"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartAccountActions = smartAccountActions;
const getCallsStatus_js_1 = require("../../actions/smartAccount/getCallsStatus.js");
const sendCalls_js_1 = require("../../actions/smartAccount/sendCalls.js");
const sendTransaction_js_1 = require("../../actions/smartAccount/sendTransaction.js");
const signMessage_js_1 = require("../../actions/smartAccount/signMessage.js");
const signTypedData_js_1 = require("../../actions/smartAccount/signTypedData.js");
const writeContract_js_1 = require("../../actions/smartAccount/writeContract.js");
function smartAccountActions(client) {
    return {
        sendTransaction: (args) => (0, sendTransaction_js_1.sendTransaction)(client, args),
        signMessage: (args) => (0, signMessage_js_1.signMessage)(client, args),
        signTypedData: (args) => (0, signTypedData_js_1.signTypedData)(client, args),
        writeContract: (args) => (0, writeContract_js_1.writeContract)(client, args),
        sendCalls: (args) => (0, sendCalls_js_1.sendCalls)(client, args),
        getCallsStatus: (args) => (0, getCallsStatus_js_1.getCallsStatus)(client, args)
    };
}
//# sourceMappingURL=smartAccount.js.map