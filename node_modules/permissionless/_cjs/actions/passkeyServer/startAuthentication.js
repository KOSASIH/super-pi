"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAuthentication = void 0;
const ox_1 = require("ox");
const viem_1 = require("viem");
const startAuthentication = async (client) => {
    const response = await client.request({
        method: "pks_startAuthentication",
        params: []
    });
    return {
        challenge: (0, viem_1.toHex)(ox_1.Base64.toBytes(response.challenge)),
        rpId: response.rpId,
        userVerification: response.userVerification,
        uuid: response.uuid
    };
};
exports.startAuthentication = startAuthentication;
//# sourceMappingURL=startAuthentication.js.map