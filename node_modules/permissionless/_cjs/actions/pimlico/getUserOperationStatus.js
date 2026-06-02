"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOperationStatus = void 0;
const getUserOperationStatus = async (client, { hash }) => {
    return client.request({
        method: "pimlico_getUserOperationStatus",
        params: [hash]
    });
};
exports.getUserOperationStatus = getUserOperationStatus;
//# sourceMappingURL=getUserOperationStatus.js.map