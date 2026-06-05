import { createClient } from "viem";
import { bundlerActions } from "viem/account-abstraction";
import { smartAccountActions } from "./decorators/smartAccount.js";
export function createSmartAccountClient(parameters) {
    const { client: client_, key = "bundler", name = "Bundler Client", paymaster, paymasterContext, bundlerTransport, userOperation } = parameters;
    const client = Object.assign(createClient({
        ...parameters,
        chain: parameters.chain ?? client_?.chain,
        transport: bundlerTransport,
        key,
        name,
        type: "bundlerClient" // TODO: is this okay?
    }), { client: client_, paymaster, paymasterContext, userOperation });
    if (parameters.userOperation?.prepareUserOperation) {
        const customPrepareUserOp = parameters.userOperation.prepareUserOperation;
        return client
            .extend(bundlerActions)
            .extend((client) => ({
            prepareUserOperation: (args) => {
                return customPrepareUserOp(client, args);
            }
        }))
            .extend(bundlerActions)
            .extend((client) => ({
            prepareUserOperation: (args) => {
                return customPrepareUserOp(client, args);
            }
        }))
            .extend(smartAccountActions);
    }
    return client
        .extend(bundlerActions)
        .extend(smartAccountActions);
}
//# sourceMappingURL=createSmartAccountClient.js.map