"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareUserOperationForErc20Paymaster = void 0;
const viem_1 = require("viem");
const account_abstraction_1 = require("viem/account-abstraction");
const actions_1 = require("viem/actions");
const actions_2 = require("viem/actions");
const utils_1 = require("viem/utils");
const pimlico_js_1 = require("../../../actions/pimlico.js");
const erc20BalanceOverride_js_1 = require("../../../utils/erc20BalanceOverride.js");
const MAINNET_USDT_ADDRESS = (0, viem_1.getAddress)("0xdAC17F958D2ee523a2206206994597C13D831ec7");
const prepareUserOperationForErc20Paymaster = (pimlicoClient, { balanceOverride = false, balanceSlot: _balanceSlot } = {}) => async (client, parameters_) => {
    const parameters = parameters_;
    const account_ = client.account;
    if (!account_)
        throw new Error("Account not found");
    const account = (0, utils_1.parseAccount)(account_);
    const bundlerClient = client;
    const paymasterContext = parameters.paymasterContext
        ? parameters.paymasterContext
        : bundlerClient?.paymasterContext;
    if (typeof paymasterContext === "object" &&
        paymasterContext !== null &&
        "token" in paymasterContext &&
        typeof paymasterContext.token === "string") {
        const token = (0, viem_1.getAddress)(paymasterContext.token);
        let chainId;
        async function getChainId() {
            if (chainId)
                return chainId;
            if (client.chain)
                return client.chain.id;
            const chainId_ = await (0, utils_1.getAction)(client, actions_1.getChainId, "getChainId")({});
            chainId = chainId_;
            return chainId;
        }
        const quotes = await (0, utils_1.getAction)(pimlicoClient, pimlico_js_1.getTokenQuotes, "getTokenQuotes")({
            tokens: [token],
            chain: pimlicoClient.chain ?? client.chain ?? account.client.chain,
            entryPointAddress: account.entryPoint.address
        });
        if (quotes.length === 0) {
            throw new viem_1.RpcError(new Error("Quotes not found"), {
                shortMessage: "client didn't return token quotes, check if the token is supported"
            });
        }
        const { postOpGas, exchangeRate, paymaster: paymasterERC20Address } = quotes[0];
        let calls = parameters.calls;
        if (parameters.callData && account.decodeCalls) {
            calls = await account.decodeCalls(parameters.callData);
        }
        const callsWithDummyApproval = [
            {
                abi: viem_1.erc20Abi,
                functionName: "approve",
                args: [paymasterERC20Address, viem_1.maxUint256],
                to: paymasterContext.token
            },
            ...(calls ? calls : [])
        ];
        if (token === MAINNET_USDT_ADDRESS) {
            callsWithDummyApproval.unshift({
                abi: viem_1.erc20Abi,
                functionName: "approve",
                args: [paymasterERC20Address, 0n],
                to: MAINNET_USDT_ADDRESS
            });
        }
        const balanceSlot = _balanceSlot ?? quotes[0].balanceSlot;
        const hasBalanceSlot = balanceSlot !== undefined;
        if (!hasBalanceSlot && balanceOverride) {
            throw new Error(`balanceOverride is not supported for token ${token}, provide custom slot for balance & allowance overrides`);
        }
        const balanceStateOverride = balanceOverride && hasBalanceSlot
            ? (0, erc20BalanceOverride_js_1.erc20BalanceOverride)({
                token,
                owner: account.address,
                slot: balanceSlot
            })[0]
            : undefined;
        parameters.stateOverride =
            balanceOverride && balanceStateOverride
                ? (parameters.stateOverride ?? []).concat([
                    {
                        address: token,
                        stateDiff: [
                            ...(balanceStateOverride.stateDiff ?? [])
                        ]
                    }
                ])
                : parameters.stateOverride;
        const userOperation = await (0, utils_1.getAction)(client, account_abstraction_1.prepareUserOperation, "prepareUserOperation")({
            ...parameters,
            paymaster: {
                getPaymasterData: (args) => {
                    const paymaster = parameters.paymaster ?? bundlerClient?.paymaster;
                    if (typeof paymaster === "object") {
                        const { getPaymasterStubData } = paymaster;
                        if (getPaymasterStubData) {
                            return getPaymasterStubData(args);
                        }
                    }
                    return (0, utils_1.getAction)(bundlerClient, account_abstraction_1.getPaymasterData, "getPaymasterData")(args);
                }
            },
            calls: callsWithDummyApproval
        });
        const maxFeePerGas = userOperation.maxFeePerGas;
        const userOperationMaxGas = userOperation.preVerificationGas +
            userOperation.callGasLimit +
            userOperation.verificationGasLimit +
            (userOperation.paymasterPostOpGasLimit || 0n) +
            (userOperation.paymasterVerificationGasLimit || 0n);
        const userOperationMaxCost = userOperationMaxGas * maxFeePerGas;
        const maxCostInToken = ((userOperationMaxCost + postOpGas * maxFeePerGas) *
            exchangeRate) /
            BigInt(1e18);
        const publicClient = account.client;
        const allowance = await (0, utils_1.getAction)(publicClient, actions_2.readContract, "readContract")({
            abi: viem_1.erc20Abi,
            functionName: "allowance",
            args: [account.address, paymasterERC20Address],
            address: token
        });
        const hasSufficientApproval = allowance >= maxCostInToken;
        const finalCalls = calls ? [...calls] : [];
        if (!hasSufficientApproval) {
            finalCalls.unshift({
                abi: viem_1.erc20Abi,
                functionName: "approve",
                args: [paymasterERC20Address, maxCostInToken],
                to: paymasterContext.token
            });
        }
        if (token === MAINNET_USDT_ADDRESS) {
            finalCalls.unshift({
                abi: viem_1.erc20Abi,
                functionName: "approve",
                args: [paymasterERC20Address, 0n],
                to: MAINNET_USDT_ADDRESS
            });
        }
        userOperation.callData = await account.encodeCalls(finalCalls.map((call_) => {
            const call = call_;
            if ("abi" in call)
                return {
                    data: (0, viem_1.encodeFunctionData)(call),
                    to: call.to,
                    value: call.value
                };
            return call;
        }));
        parameters.calls = finalCalls;
        const paymaster = parameters.paymaster ?? bundlerClient?.paymaster;
        const { getPaymasterData } = (() => {
            if (paymaster === true)
                return {
                    getPaymasterData: (parameters) => (0, utils_1.getAction)(bundlerClient, account_abstraction_1.getPaymasterData, "getPaymasterData")(parameters)
                };
            if (typeof paymaster === "object" &&
                paymaster.getPaymasterData) {
                const { getPaymasterData } = paymaster;
                return {
                    getPaymasterData
                };
            }
            throw new Error("Expected paymaster: cannot sponsor ERC-20 without paymaster");
        })();
        const paymasterData = await getPaymasterData({
            chainId: await getChainId(),
            entryPointAddress: account.entryPoint.address,
            context: paymasterContext,
            ...userOperation
        });
        return {
            ...userOperation,
            ...paymasterData
        };
    }
    return (await (0, utils_1.getAction)(client, account_abstraction_1.prepareUserOperation, "prepareUserOperation")(parameters));
};
exports.prepareUserOperationForErc20Paymaster = prepareUserOperationForErc20Paymaster;
//# sourceMappingURL=prepareUserOperationForErc20Paymaster.js.map