"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddressFromInitCodeOrPaymasterAndData = getAddressFromInitCodeOrPaymasterAndData;
const viem_1 = require("viem");
function getAddressFromInitCodeOrPaymasterAndData(data) {
    if (!data) {
        return undefined;
    }
    if (data.length >= 42) {
        return (0, viem_1.getAddress)(data.slice(0, 42));
    }
    return undefined;
}
//# sourceMappingURL=getAddressFromInitCodeOrPaymasterAndData.js.map