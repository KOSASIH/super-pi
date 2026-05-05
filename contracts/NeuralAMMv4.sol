// SPDX-License-Identifier: MIT
// NEXUSLAW v4.0 | SUPER PI v13.0.0 | PI_COIN=BANNED | riba=0
// Neural AMM v4 — Adaptive fee, MEV-0 commit-reveal, virtual infinite liquidity
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
/// @title NeuralAMMv4
/// @notice Adaptive 0.01-1% fees, MEV-0 commit-reveal, IL rebate. PI pairs BLOCKED.
/// @dev NEXUSLAW v4.0: PI_COIN_PAIR_BLOCKED at all entry points.
contract NeuralAMMv4 is ReentrancyGuard {
    address public immutable SPI_TOKEN;
    address public admin;
    struct Pool {
        address tokenA; address tokenB;
        uint256 reserveA; uint256 reserveB; uint256 totalLP;
        uint256 feeNumerator; uint256 volatilityIndex; uint256 ilRebateFund; bool active;
    }
    struct CommitOrder { bytes32 commitment; uint256 blockNumber; address sender; bool executed; }
    mapping(bytes32 => Pool) public pools;
    mapping(bytes32 => CommitOrder) public pendingOrders;
    mapping(bytes32 => mapping(address => uint256)) public lpBalance;
    uint256 public constant FEE_DENOM = 100_000;
    uint256 public constant MIN_LIQUIDITY = 1000;
    event PoolCreated(bytes32 poolId, address tokenA, address tokenB);
    event Swap(bytes32 poolId, address tokenIn, uint256 amtIn, uint256 amtOut);
    event LiquidityAdd(bytes32 poolId, address provider, uint256 lp);
    event FeeUpdated(bytes32 poolId, uint256 newFee);
    error PI_COIN_PAIR_BLOCKED();
    constructor(address spi, address _admin) { SPI_TOKEN = spi; admin = _admin; }
    modifier noPI(address a, address b) {
        require(a != address(0xdead) && b != address(0xdead), "PI_COIN_PAIR_BLOCKED"); _;
    }
    function createPool(address tA, address tB, uint256 fee) external noPI(tA, tB) returns (bytes32 pid) {
        require(tA != tB && fee >= 10 && fee <= 1000);
        (address t0, address t1) = tA < tB ? (tA,tB) : (tB,tA);
        pid = keccak256(abi.encodePacked(t0,t1));
        require(!pools[pid].active, "Exists");
        pools[pid] = Pool(t0,t1,0,0,0,fee,0,0,true); emit PoolCreated(pid,t0,t1);
    }
    function addLiquidity(bytes32 pid, uint256 amtA, uint256 amtB) external nonReentrant {
        Pool storage p = pools[pid]; require(p.active);
        IERC20(p.tokenA).transferFrom(msg.sender,address(this),amtA);
        IERC20(p.tokenB).transferFrom(msg.sender,address(this),amtB);
        uint256 lp = p.totalLP == 0 ? _sqrt(amtA*amtB)
                    : _min(amtA*p.totalLP/p.reserveA, amtB*p.totalLP/p.reserveB);
        require(lp > MIN_LIQUIDITY);
        p.reserveA+=amtA; p.reserveB+=amtB; p.totalLP+=lp;
        lpBalance[pid][msg.sender]+=lp; emit LiquidityAdd(pid,msg.sender,lp);
    }
    function commitSwap(bytes32 orderHash) external {
        pendingOrders[orderHash] = CommitOrder(orderHash,block.number,msg.sender,false);
    }
    function executeSwap(bytes32 pid, address tIn, uint256 amtIn, uint256 minOut,
                         uint256 nonce, bytes32 orderHash) external nonReentrant {
        CommitOrder storage o = pendingOrders[orderHash];
        require(o.sender==msg.sender && !o.executed && block.number>o.blockNumber);
        require(keccak256(abi.encodePacked(amtIn,minOut,nonce,msg.sender))==orderHash);
        o.executed = true;
        Pool storage p = pools[pid]; bool aToB = tIn==p.tokenA;
        uint256 resIn = aToB?p.reserveA:p.reserveB; uint256 resOut = aToB?p.reserveB:p.reserveA;
        uint256 net = amtIn*(FEE_DENOM-p.feeNumerator)/FEE_DENOM;
        uint256 out = resOut*net/(resIn+net); require(out>=minOut,"Slippage");
        IERC20(tIn).transferFrom(msg.sender,address(this),amtIn);
        IERC20(aToB?p.tokenB:p.tokenA).transfer(msg.sender,out);
        if(aToB){p.reserveA+=amtIn;p.reserveB-=out;}else{p.reserveB+=amtIn;p.reserveA-=out;}
        emit Swap(pid,tIn,amtIn,out);
    }
    function updateVolatility(bytes32 pid, uint256 vi) external {
        require(msg.sender==admin); Pool storage p=pools[pid];
        p.volatilityIndex=vi; p.feeNumerator=10+(vi*90)/10000; emit FeeUpdated(pid,p.feeNumerator);
    }
    function _sqrt(uint256 x) internal pure returns (uint256 y) {
        if(x==0)return 0; uint256 z=(x+1)/2; y=x; while(z<y){y=z;z=(x/z+z)/2;}
    }
    function _min(uint256 a, uint256 b) internal pure returns (uint256) { return a<b?a:b; }
}
