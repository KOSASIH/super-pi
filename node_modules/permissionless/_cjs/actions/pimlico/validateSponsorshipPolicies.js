"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSponsorshipPolicies = void 0;
const deepHexlify_js_1 = require("../../utils/deepHexlify.js");
const validateSponsorshipPolicies = async (client, args) => {
    return await client.request({
        method: "pm_validateSponsorshipPolicies",
        params: [
            (0, deepHexlify_js_1.deepHexlify)(args.userOperation),
            args.entryPointAddress,
            args.sponsorshipPolicyIds
        ]
    });
};
exports.validateSponsorshipPolicies = validateSponsorshipPolicies;
//# sourceMappingURL=validateSponsorshipPolicies.js.map