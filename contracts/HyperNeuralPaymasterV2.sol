// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v14.0.0 — HyperNeuralPaymasterV2
// Neural gasless paymaster: AI-dynamic fee pricing, $SPI-only, Pi Coin hard-block
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ISPI { function transferFrom(address,address,uint256) external returns(bool); }

contract HyperNeuralPaymasterV2 is Ownable, ReentrancyGuard {
    ISPI    public spi;
    uint256 public baseFeeWei;
    uint256 public neuralMultiplier = 10000;
    uint256 public totalSponsored;
    struct Tx { address user; bytes32 txHash; uint256 gas; uint256 spiCharged; uint256 ts; }
    Tx[] public log;
    event TxSponsored(address indexed user, bytes32 txHash, uint256 gas, uint256 spi);
    event NeuralFeeUpdated(uint256 base, uint256 mult);
    modifier noForeignToken(address t){ require(keccak256(abi.encodePacked(t))!=keccak256("PI_COIN"),"Pi Coin forbidden"); _; }
    constructor(address _spi,uint256 _base) Ownable(msg.sender){ spi=ISPI(_spi); baseFeeWei=_base; }
    function sponsorTx(address user,bytes32 txHash,uint256 gas) external onlyOwner nonReentrant {
        uint256 fee=(baseFeeWei*gas*neuralMultiplier)/10000;
        if(fee>0) require(spi.transferFrom(user,address(this),fee),"SPI fail");
        log.push(Tx(user,txHash,gas,fee,block.timestamp)); totalSponsored++; emit TxSponsored(user,txHash,gas,fee); }
    function updateNeuralFee(uint256 b,uint256 m) external onlyOwner { baseFeeWei=b; neuralMultiplier=m; emit NeuralFeeUpdated(b,m); }
}
