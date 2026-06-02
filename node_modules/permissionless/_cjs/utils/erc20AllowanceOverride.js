"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.erc20AllowanceOverride = erc20AllowanceOverride;
const viem_1 = require("viem");
function erc20AllowanceOverride({ token, owner, spender, slot, amount = BigInt("0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF") }) {
    const smartAccountErc20AllowanceSlot = (0, viem_1.keccak256)((0, viem_1.encodeAbiParameters)([
        {
            type: "address"
        },
        {
            type: "bytes32"
        }
    ], [
        spender,
        (0, viem_1.keccak256)((0, viem_1.encodeAbiParameters)([
            {
                type: "address"
            },
            {
                type: "uint256"
            }
        ], [owner, BigInt(slot)]))
    ]));
    return [
        {
            address: token,
            stateDiff: [
                {
                    slot: smartAccountErc20AllowanceSlot,
                    value: (0, viem_1.toHex)(amount)
                }
            ]
        }
    ];
}
//# sourceMappingURL=erc20AllowanceOverride.js.map