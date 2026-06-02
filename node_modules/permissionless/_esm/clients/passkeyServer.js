import { createClient } from "viem";
import { passkeyServerActions } from "./decorators/passkeyServer.js";
export function createPasskeyServerClient(parameters) {
    const { key = "public", name = "Passkey Server Client" } = parameters;
    return createClient({
        ...parameters,
        key,
        name,
        type: "passkeyServerClient"
    }).extend(passkeyServerActions);
}
//# sourceMappingURL=passkeyServer.js.map