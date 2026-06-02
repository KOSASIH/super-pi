"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInitMSAData = void 0;
const viem_1 = require("viem");
const EtherspotBootstrapAbi_js_1 = require("../abi/EtherspotBootstrapAbi.js");
const getInitMSAData = (ecdsaValidatorAddress) => {
    const validators = makeBootstrapConfig(ecdsaValidatorAddress, "0x");
    const executors = makeBootstrapConfig(viem_1.zeroAddress, "0x");
    const hook = _makeBootstrapConfig(viem_1.zeroAddress, "0x");
    const fallbacks = makeBootstrapConfig(viem_1.zeroAddress, "0x");
    const initMSAData = (0, viem_1.encodeFunctionData)({
        abi: EtherspotBootstrapAbi_js_1.EtherspotBootstrapAbi,
        functionName: "initMSA",
        args: [validators, executors, hook, fallbacks]
    });
    return initMSAData;
};
exports.getInitMSAData = getInitMSAData;
const _makeBootstrapConfig = (module, data) => {
    const config = {
        module: "",
        data: ""
    };
    config.module = module;
    config.data = (0, viem_1.encodeFunctionData)({
        abi: EtherspotBootstrapAbi_js_1.EtherspotOnInstallAbi,
        functionName: "onInstall",
        args: [data]
    });
    return config;
};
const makeBootstrapConfig = (module, data) => {
    const config = [];
    const data1 = (0, viem_1.encodeFunctionData)({
        abi: EtherspotBootstrapAbi_js_1.EtherspotOnInstallAbi,
        functionName: "onInstall",
        args: [data]
    });
    const newConfig = {
        module: module,
        data: data1
    };
    config.push(newConfig);
    return config;
};
//# sourceMappingURL=getInitMSAData.js.map