import { createClient } from "viem";
import { bundlerActions, entryPoint07Address, paymasterActions } from "viem/account-abstraction";
import { pimlicoActions } from "./decorators/pimlico.js";
export function createPimlicoClient(parameters) {
    const { key = "public", name = "Pimlico Bundler Client", entryPoint } = parameters;
    return createClient({
        ...parameters,
        key,
        name,
        type: "pimlicoClient"
    })
        .extend(bundlerActions)
        .extend(paymasterActions)
        .extend(pimlicoActions({
        entryPoint: {
            address: entryPoint?.address ?? entryPoint07Address,
            version: entryPoint?.version ?? "0.7"
        }
    }));
}
//# sourceMappingURL=pimlico.js.map