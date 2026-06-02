"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPimlicoClient = createPimlicoClient;
const viem_1 = require("viem");
const account_abstraction_1 = require("viem/account-abstraction");
const pimlico_js_1 = require("./decorators/pimlico.js");
function createPimlicoClient(parameters) {
    const { key = "public", name = "Pimlico Bundler Client", entryPoint } = parameters;
    return (0, viem_1.createClient)({
        ...parameters,
        key,
        name,
        type: "pimlicoClient"
    })
        .extend(account_abstraction_1.bundlerActions)
        .extend(account_abstraction_1.paymasterActions)
        .extend((0, pimlico_js_1.pimlicoActions)({
        entryPoint: {
            address: entryPoint?.address ?? account_abstraction_1.entryPoint07Address,
            version: entryPoint?.version ?? "0.7"
        }
    }));
}
//# sourceMappingURL=pimlico.js.map