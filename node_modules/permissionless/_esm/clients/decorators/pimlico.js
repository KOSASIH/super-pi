import { getTokenQuotes, sendCompressedUserOperation, validateSponsorshipPolicies } from "../../actions/pimlico.js";
import { estimateErc20PaymasterCost } from "../../actions/pimlico/estimateErc20PaymasterCost.js";
import { getUserOperationGasPrice } from "../../actions/pimlico/getUserOperationGasPrice.js";
import { getUserOperationStatus } from "../../actions/pimlico/getUserOperationStatus.js";
import { sponsorUserOperation } from "../../actions/pimlico/sponsorUserOperation.js";
export const pimlicoActions = ({ entryPoint }) => (client) => ({
    getUserOperationGasPrice: async () => getUserOperationGasPrice(client),
    getUserOperationStatus: async (args) => getUserOperationStatus(client, args),
    sendCompressedUserOperation: async (args) => sendCompressedUserOperation(client, {
        ...args,
        entryPointAddress: entryPoint.address
    }),
    sponsorUserOperation: async (args) => sponsorUserOperation(client, {
        ...args,
        entryPoint
    }),
    validateSponsorshipPolicies: async (args) => validateSponsorshipPolicies(client, {
        ...args,
        entryPointAddress: entryPoint.address
    }),
    getTokenQuotes: async (args) => getTokenQuotes(client, {
        ...args,
        chain: args.chain,
        entryPointAddress: entryPoint.address
    }),
    estimateErc20PaymasterCost: async (args) => estimateErc20PaymasterCost(client, {
        ...args,
        entryPoint,
        chain: args.chain
    })
});
//# sourceMappingURL=pimlico.js.map