import { encodeFunctionData, zeroAddress } from "viem";
import { EtherspotBootstrapAbi, EtherspotOnInstallAbi } from "../abi/EtherspotBootstrapAbi.js";
export const getInitMSAData = (ecdsaValidatorAddress) => {
    const validators = makeBootstrapConfig(ecdsaValidatorAddress, "0x");
    const executors = makeBootstrapConfig(zeroAddress, "0x");
    const hook = _makeBootstrapConfig(zeroAddress, "0x");
    const fallbacks = makeBootstrapConfig(zeroAddress, "0x");
    const initMSAData = encodeFunctionData({
        abi: EtherspotBootstrapAbi,
        functionName: "initMSA",
        args: [validators, executors, hook, fallbacks]
    });
    return initMSAData;
};
const _makeBootstrapConfig = (module, data) => {
    const config = {
        module: "",
        data: ""
    };
    config.module = module;
    config.data = encodeFunctionData({
        abi: EtherspotOnInstallAbi,
        functionName: "onInstall",
        args: [data]
    });
    return config;
};
const makeBootstrapConfig = (module, data) => {
    const config = [];
    const data1 = encodeFunctionData({
        abi: EtherspotOnInstallAbi,
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