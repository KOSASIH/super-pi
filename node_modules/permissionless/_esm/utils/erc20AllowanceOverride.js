import { encodeAbiParameters, keccak256, toHex } from "viem";
export function erc20AllowanceOverride({ token, owner, spender, slot, amount = BigInt("0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF") }) {
    const smartAccountErc20AllowanceSlot = keccak256(encodeAbiParameters([
        {
            type: "address"
        },
        {
            type: "bytes32"
        }
    ], [
        spender,
        keccak256(encodeAbiParameters([
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
                    value: toHex(amount)
                }
            ]
        }
    ];
}
//# sourceMappingURL=erc20AllowanceOverride.js.map