import { getCode } from "viem/actions";
export const isSmartAccountDeployed = async (client, address) => {
    const contractCode = await getCode(client, {
        address: address
    });
    return Boolean(contractCode);
};
//# sourceMappingURL=isSmartAccountDeployed.js.map