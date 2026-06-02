"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passkeyServerActions = void 0;
const getCredentials_js_1 = require("../../actions/passkeyServer/getCredentials.js");
const startAuthentication_js_1 = require("../../actions/passkeyServer/startAuthentication.js");
const startRegistration_js_1 = require("../../actions/passkeyServer/startRegistration.js");
const verifyAuthentication_js_1 = require("../../actions/passkeyServer/verifyAuthentication.js");
const verifyRegistration_js_1 = require("../../actions/passkeyServer/verifyRegistration.js");
const passkeyServerActions = (client) => ({
    startRegistration: (args) => (0, startRegistration_js_1.startRegistration)(client, args),
    verifyRegistration: (args) => (0, verifyRegistration_js_1.verifyRegistration)(client, args),
    getCredentials: (args) => (0, getCredentials_js_1.getCredentials)(client, args),
    startAuthentication: () => (0, startAuthentication_js_1.startAuthentication)(client),
    verifyAuthentication: (args) => (0, verifyAuthentication_js_1.verifyAuthentication)(client, args)
});
exports.passkeyServerActions = passkeyServerActions;
//# sourceMappingURL=passkeyServer.js.map