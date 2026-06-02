import { Base64 } from "ox";
import { toHex } from "viem";
export const startAuthentication = async (client) => {
    const response = await client.request({
        method: "pks_startAuthentication",
        params: []
    });
    return {
        challenge: toHex(Base64.toBytes(response.challenge)),
        rpId: response.rpId,
        userVerification: response.userVerification,
        uuid: response.uuid
    };
};
//# sourceMappingURL=startAuthentication.js.map