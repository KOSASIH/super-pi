"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionReceiptStatus = void 0;
exports.deepHexlify = deepHexlify;
const viem_1 = require("viem");
exports.transactionReceiptStatus = {
    "0x0": "reverted",
    "0x1": "success"
};
function deepHexlify(obj) {
    if (typeof obj === "function") {
        return undefined;
    }
    if (obj == null || typeof obj === "string" || typeof obj === "boolean") {
        return obj;
    }
    if (typeof obj === "bigint") {
        return (0, viem_1.toHex)(obj);
    }
    if (obj._isBigNumber != null || typeof obj !== "object") {
        return (0, viem_1.toHex)(obj).replace(/^0x0/, "0x");
    }
    if (Array.isArray(obj)) {
        return obj.map((member) => deepHexlify(member));
    }
    return Object.keys(obj).reduce((set, key) => {
        set[key] = deepHexlify(obj[key]);
        return set;
    }, {});
}
//# sourceMappingURL=deepHexlify.js.map