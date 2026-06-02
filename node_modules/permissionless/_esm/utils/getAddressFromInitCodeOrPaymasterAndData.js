import { getAddress } from "viem";
export function getAddressFromInitCodeOrPaymasterAndData(data) {
    if (!data) {
        return undefined;
    }
    if (data.length >= 42) {
        return getAddress(data.slice(0, 42));
    }
    return undefined;
}
//# sourceMappingURL=getAddressFromInitCodeOrPaymasterAndData.js.map