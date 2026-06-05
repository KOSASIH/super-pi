"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pimlicoActions = void 0;
const pimlico_js_1 = require("../../actions/pimlico.js");
const estimateErc20PaymasterCost_js_1 = require("../../actions/pimlico/estimateErc20PaymasterCost.js");
const getUserOperationGasPrice_js_1 = require("../../actions/pimlico/getUserOperationGasPrice.js");
const getUserOperationStatus_js_1 = require("../../actions/pimlico/getUserOperationStatus.js");
const sponsorUserOperation_js_1 = require("../../actions/pimlico/sponsorUserOperation.js");
const pimlicoActions = ({ entryPoint }) => (client) => ({
    getUserOperationGasPrice: async () => (0, getUserOperationGasPrice_js_1.getUserOperationGasPrice)(client),
    getUserOperationStatus: async (args) => (0, getUserOperationStatus_js_1.getUserOperationStatus)(client, args),
    sendCompressedUserOperation: async (args) => (0, pimlico_js_1.sendCompressedUserOperation)(client, {
        ...args,
        entryPointAddress: entryPoint.address
    }),
    sponsorUserOperation: async (args) => (0, sponsorUserOperation_js_1.sponsorUserOperation)(client, {
        ...args,
        entryPoint
    }),
    validateSponsorshipPolicies: async (args) => (0, pimlico_js_1.validateSponsorshipPolicies)(client, {
        ...args,
        entryPointAddress: entryPoint.address
    }),
    getTokenQuotes: async (args) => (0, pimlico_js_1.getTokenQuotes)(client, {
        ...args,
        chain: args.chain,
        entryPointAddress: entryPoint.address
    }),
    estimateErc20PaymasterCost: async (args) => (0, estimateErc20PaymasterCost_js_1.estimateErc20PaymasterCost)(client, {
        ...args,
        entryPoint,
        chain: args.chain
    })
});
exports.pimlicoActions = pimlicoActions;
//# sourceMappingURL=pimlico.js.map