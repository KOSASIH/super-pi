"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONTRACT_ADDRESS = exports.VALIDATOR_MODE = exports.VALIDATOR_TYPE = exports.DUMMY_ECDSA_SIGNATURE = void 0;
exports.DUMMY_ECDSA_SIGNATURE = "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
exports.VALIDATOR_TYPE = {
    ROOT: "0x00",
    VALIDATOR: "0x01",
    PERMISSION: "0x02"
};
var VALIDATOR_MODE;
(function (VALIDATOR_MODE) {
    VALIDATOR_MODE["DEFAULT"] = "0x00";
    VALIDATOR_MODE["ENABLE"] = "0x01";
})(VALIDATOR_MODE || (exports.VALIDATOR_MODE = VALIDATOR_MODE = {}));
exports.DEFAULT_CONTRACT_ADDRESS = {
    metaFactoryAddress: "0x93FB56A4a0B7160fbf8903d251Cc7A3fb9bA0933",
    bootstrapAddress: "0x1baCB2F1ef4fD02f02e32cCF70888D9Caeb5f066",
    validatorAddress: "0x7aCEE15c9FFc1e8f287C26E0f4C8244A0729F557"
};
//# sourceMappingURL=constants.js.map