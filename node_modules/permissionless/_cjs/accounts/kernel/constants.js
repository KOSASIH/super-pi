"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALIDATOR_MODE = exports.VALIDATOR_TYPE = exports.ROOT_MODE_KERNEL_V2 = exports.DUMMY_ECDSA_SIGNATURE = void 0;
exports.DUMMY_ECDSA_SIGNATURE = "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
exports.ROOT_MODE_KERNEL_V2 = "0x00000000";
exports.VALIDATOR_TYPE = {
    ROOT: "0x00",
    VALIDATOR: "0x01",
    PERMISSION: "0x02",
    EIP7702: "0x00"
};
var VALIDATOR_MODE;
(function (VALIDATOR_MODE) {
    VALIDATOR_MODE["DEFAULT"] = "0x00";
    VALIDATOR_MODE["ENABLE"] = "0x01";
})(VALIDATOR_MODE || (exports.VALIDATOR_MODE = VALIDATOR_MODE = {}));
//# sourceMappingURL=constants.js.map