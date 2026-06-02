"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPasskeyServerClient = createPasskeyServerClient;
const viem_1 = require("viem");
const passkeyServer_js_1 = require("./decorators/passkeyServer.js");
function createPasskeyServerClient(parameters) {
    const { key = "public", name = "Passkey Server Client" } = parameters;
    return (0, viem_1.createClient)({
        ...parameters,
        key,
        name,
        type: "passkeyServerClient"
    }).extend(passkeyServer_js_1.passkeyServerActions);
}
//# sourceMappingURL=passkeyServer.js.map