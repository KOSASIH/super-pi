import { readContract } from "viem/actions";
import { getAction } from "viem/utils";
export const getAccountAddress = async (client, args) => {
    const { adminAddress, factoryAddress, salt } = args;
    return getAction(client, readContract, "readContract")({
        address: factoryAddress,
        abi: [
            {
                inputs: [
                    {
                        name: "_adminSigner",
                        type: "address"
                    },
                    {
                        name: "_data",
                        type: "bytes"
                    }
                ],
                name: "getAddress",
                outputs: [
                    {
                        type: "address"
                    }
                ],
                stateMutability: "view",
                type: "function"
            }
        ],
        functionName: "getAddress",
        args: [adminAddress, salt]
    });
};
//# sourceMappingURL=getAccountAddress.js.map