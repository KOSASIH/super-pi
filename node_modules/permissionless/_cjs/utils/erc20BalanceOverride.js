"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.erc20BalanceOverride = erc20BalanceOverride;
const viem_1 = require("viem");
function erc20BalanceOverride({ token, owner, slot, balance = BigInt("0x100000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF") }) {
    const smartAccountErc20BalanceSlot = (0, viem_1.keccak256)((0, viem_1.encodeAbiParameters)([
        {
            type: "address"
        },
        {
            type: "uint256"
        }
    ], [owner, slot]));
    return [
        {
            address: token,
            stateDiff: [
                {
                    slot: smartAccountErc20BalanceSlot,
                    value: (0, viem_1.toHex)(balance)
                }
            ]
        }
    ];
}
//# sourceMappingURL=erc20BalanceOverride.js.map