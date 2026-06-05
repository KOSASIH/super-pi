"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSmartAccountClient = createSmartAccountClient;
const viem_1 = require("viem");
const account_abstraction_1 = require("viem/account-abstraction");
const smartAccount_js_1 = require("./decorators/smartAccount.js");
function createSmartAccountClient(parameters) {
    const { client: client_, key = "bundler", name = "Bundler Client", paymaster, paymasterContext, bundlerTransport, userOperation } = parameters;
    const client = Object.assign((0, viem_1.createClient)({
        ...parameters,
        chain: parameters.chain ?? client_?.chain,
        transport: bundlerTransport,
        key,
        name,
        type: "bundlerClient"
    }), { client: client_, paymaster, paymasterContext, userOperation });
    if (parameters.userOperation?.prepareUserOperation) {
        const customPrepareUserOp = parameters.userOperation.prepareUserOperation;
        return client
            .extend(account_abstraction_1.bundlerActions)
            .extend((client) => ({
            prepareUserOperation: (args) => {
                return customPrepareUserOp(client, args);
            }
        }))
            .extend(account_abstraction_1.bundlerActions)
            .extend((client) => ({
            prepareUserOperation: (args) => {
                return customPrepareUserOp(client, args);
            }
        }))
            .extend(smartAccount_js_1.smartAccountActions);
    }
    return client
        .extend(account_abstraction_1.bundlerActions)
        .extend(smartAccount_js_1.smartAccountActions);
}
//# sourceMappingURL=createSmartAccountClient.js.map