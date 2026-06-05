"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isKernelV2 = void 0;
const isKernelV2 = (version) => {
    const regex = /0\.2\.\d+/;
    return regex.test(version);
};
exports.isKernelV2 = isKernelV2;
//# sourceMappingURL=isKernelV2.js.map