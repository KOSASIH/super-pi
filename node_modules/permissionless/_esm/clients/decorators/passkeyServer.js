import { getCredentials } from "../../actions/passkeyServer/getCredentials.js";
import { startAuthentication } from "../../actions/passkeyServer/startAuthentication.js";
import { startRegistration } from "../../actions/passkeyServer/startRegistration.js";
import { verifyAuthentication } from "../../actions/passkeyServer/verifyAuthentication.js";
import { verifyRegistration } from "../../actions/passkeyServer/verifyRegistration.js";
export const passkeyServerActions = (client) => ({
    startRegistration: (args) => startRegistration(client, args),
    verifyRegistration: (args) => verifyRegistration(client, args),
    getCredentials: (args) => getCredentials(client, args),
    startAuthentication: () => startAuthentication(client),
    verifyAuthentication: (args) => verifyAuthentication(client, args)
});
//# sourceMappingURL=passkeyServer.js.map