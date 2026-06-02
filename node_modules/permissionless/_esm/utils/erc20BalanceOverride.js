import { encodeAbiParameters, keccak256, toHex } from "viem";
export function erc20BalanceOverride({ token, owner, slot, balance = BigInt("0x100000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF") }) {
    const smartAccountErc20BalanceSlot = keccak256(encodeAbiParameters([
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
                    value: toHex(balance)
                }
            ]
        }
    ];
}
//# sourceMappingURL=erc20BalanceOverride.js.map