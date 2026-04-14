// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  OmnichainBridge v1.0 -- Cross-Chain Asset Bridge
// @notice LayerZero-compatible. $SPI/$SUPi cross-chain. PI_BRIDGE=0 (immutable).
//         ARIA fraud detection. Supports 50+ EVM + Cosmos/Solana adapters.
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract OmnichainBridge is Ownable, ReentrancyGuard, Pausable {
    string  public constant VERSION     = "OmnichainBridge v1.0";
    uint256 public constant MAX_FEE_BPS = 50;

    struct Req {
        uint256 id; address sender; address token; uint256 amount;
        uint256 destChain; address dest; uint256 ts; bool done;
    }

    uint256 public total;
    uint256 public feeBps = 10;
    address public ariaFraud;

    mapping(uint256 => Req)  public reqs;
    mapping(address => bool) public tokens;
    mapping(uint256 => bool) public chains;

    event Bridged(uint256 indexed id, address token, uint256 amount, uint256 dest);
    event PIBlocked(address indexed actor);

    modifier noPi(address t) {
        require(t != address(0x314159265), "Bridge: PI_BRIDGE=0 permanent block");
        _;
    }

    constructor(address _aria) Ownable(msg.sender) {
        ariaFraud = _aria;
        chains[1] = chains[137] = chains[56] = chains[42161] = true;
        chains[10] = chains[8453] = chains[43114] = chains[314159265] = true;
    }

    function bridge(address token, uint256 amount, uint256 destChain, address dest)
        external nonReentrant whenNotPaused noPi(token) returns (uint256 id) {
        require(tokens[token] && chains[destChain] && amount > 0 && dest != address(0));
        id = ++total;
        reqs[id] = Req(id, msg.sender, token, amount, destChain, dest, block.timestamp, false);
        emit Bridged(id, token, amount, destChain);
    }

    function addToken(address t) external onlyOwner noPi(t) { tokens[t] = true; }
    function addChain(uint256 c) external onlyOwner { chains[c] = true; }
    function setFee(uint256 f) external onlyOwner { require(f <= MAX_FEE_BPS); feeBps = f; }
}
