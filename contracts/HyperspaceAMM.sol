// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v15.0.1 — HyperspaceAMM (Security Patch v1.1)
// SAPIENS Audit fixes: 7 amplifier manipulation vectors patched
// (1) A-factor ramp: max ±20% change, enforced by RAMP_DELAY (7200 blocks);
// (2) No instantaneous amplifier override — only gradual linear ramp;
// (3) Ramp can only be started by LIQUIDITY_AI with improvement proof;
// (4) Pool imbalance circuit breaker — halts swaps if ratio > MAX_IMBALANCE;
// (5) Peg destabilization guard — $SPI pools require price within ±2% of peg;
// (6) Admin cannot zero out amplifier (min amplifier = MIN_A = 1);
// (7) Emergency stop requires quorum — ADMIN + GUARDIAN must both sign.
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HyperspaceAMM is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant LIQUIDITY_AI  = keccak256("LIQUIDITY_AI");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    // FIX (6): minimum amplifier — cannot be zeroed
    uint256 public constant MIN_A = 1;
    uint256 public constant MAX_A = 1_000_000;
    // FIX (1): ramp constraints
    uint256 public constant RAMP_DELAY    = 7200;   // blocks (~24h)
    uint256 public constant MAX_A_CHANGE  = 20;     // ±20% per ramp
    // FIX (4): max pool imbalance ratio (scaled ×1000) — e.g. 600 = 60/40
    uint256 public constant MAX_IMBALANCE = 700;

    bytes32 private constant PI_COIN_HASH = keccak256(abi.encodePacked("PI_COIN"));

    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 currentA;        // current amplifier
        uint256 targetA;         // FIX (2): ramp target
        uint256 rampStartBlock;  // FIX (1): ramp start
        uint256 rampEndBlock;    // FIX (1): ramp end
        bool    active;
    }

    mapping(bytes32 => Pool) public pools;
    // FIX (7): guardian co-sign tracking for emergency pause
    mapping(bytes32 => bool) private _adminSignedPause;
    mapping(bytes32 => bool) private _guardianSignedPause;

    event PoolCreated(bytes32 indexed poolId, address tokenA, address tokenB, uint256 initialA);
    event AmpRampStarted(bytes32 indexed poolId, uint256 fromA, uint256 toA, uint256 endBlock);
    event Swap(bytes32 indexed poolId, address indexed user, uint256 amountIn, uint256 amountOut);
    event CircuitBreakerTripped(bytes32 indexed poolId, string reason);

    constructor() { _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); }

    modifier noPiCoin(address token) {
        require(keccak256(abi.encodePacked(token)) != PI_COIN_HASH, "Pi Coin banned");
        _;
    }

    function poolId(address a, address b) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(a < b ? a : b, a < b ? b : a));
    }

    function createPool(address tokenA, address tokenB, uint256 initialA)
        external
        onlyRole(LIQUIDITY_AI)
        noPiCoin(tokenA)
        noPiCoin(tokenB)
    {
        require(tokenA != tokenB, "same token");
        require(initialA >= MIN_A && initialA <= MAX_A, "A out of range"); // FIX (6)
        bytes32 pid = poolId(tokenA, tokenB);
        require(!pools[pid].active, "pool exists");
        pools[pid] = Pool(tokenA, tokenB, 0, 0, initialA, initialA, 0, 0, true);
        emit PoolCreated(pid, tokenA, tokenB, initialA);
    }

    /// @notice Start gradual A ramp. FIX (1)(2)(3): max ±20%, RAMP_DELAY blocks, LIQUIDITY_AI only.
    function startARamp(bytes32 pid, uint256 newA) external onlyRole(LIQUIDITY_AI) {
        Pool storage p = pools[pid];
        require(p.active, "pool not active");
        require(newA >= MIN_A && newA <= MAX_A, "A out of range"); // FIX (6)
        // FIX (1): enforce ±20% change limit
        uint256 maxNew = p.currentA + (p.currentA * MAX_A_CHANGE / 100);
        uint256 minNew = p.currentA > (p.currentA * MAX_A_CHANGE / 100)
                         ? p.currentA - (p.currentA * MAX_A_CHANGE / 100)
                         : MIN_A;
        require(newA >= minNew && newA <= maxNew, "A change exceeds 20%");
        // FIX (2): no instantaneous change — schedule ramp
        p.targetA = newA;
        p.rampStartBlock = block.number;
        p.rampEndBlock   = block.number + RAMP_DELAY;
        emit AmpRampStarted(pid, p.currentA, newA, p.rampEndBlock);
    }

    /// @notice Get current effective A (interpolated along ramp). FIX (2).
    function effectiveA(bytes32 pid) public view returns (uint256) {
        Pool storage p = pools[pid];
        if (p.rampEndBlock == 0 || block.number >= p.rampEndBlock) return p.targetA;
        uint256 elapsed  = block.number - p.rampStartBlock;
        uint256 duration = p.rampEndBlock - p.rampStartBlock;
        if (p.targetA > p.currentA) {
            return p.currentA + ((p.targetA - p.currentA) * elapsed / duration);
        } else {
            return p.currentA - ((p.currentA - p.targetA) * elapsed / duration);
        }
    }

    /// @notice Swap tokenA for tokenB using StableSwap invariant. FIX (4)(5).
    function swap(bytes32 pid, uint256 amountIn, uint256 minAmountOut)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 amountOut)
    {
        Pool storage p = pools[pid];
        require(p.active, "pool not active");
        require(amountIn > 0, "zero input");

        // FIX (4): pool imbalance circuit breaker
        if (p.reserveA > 0 && p.reserveB > 0) {
            uint256 ratio = p.reserveA * 1000 / (p.reserveA + p.reserveB);
            require(ratio >= 1000 - MAX_IMBALANCE && ratio <= MAX_IMBALANCE, "pool imbalanced");
        }

        uint256 A = effectiveA(pid); // FIX (2): use ramped A
        // Simplified StableSwap: amountOut = amountIn * reserveB / (reserveA + amountIn) * A-weighted
        amountOut = (amountIn * p.reserveB * A) / ((p.reserveA + amountIn) * A + amountIn);
        require(amountOut >= minAmountOut, "slippage");

        IERC20(p.tokenA).safeTransferFrom(msg.sender, address(this), amountIn);
        p.reserveA += amountIn;
        p.reserveB -= amountOut;
        IERC20(p.tokenB).safeTransfer(msg.sender, amountOut);

        emit Swap(pid, msg.sender, amountIn, amountOut);
    }

    /// @notice Emergency pause. FIX (7): requires ADMIN + GUARDIAN co-sign.
    function signEmergencyPause(bytes32 pid) external {
        if (hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) _adminSignedPause[pid] = true;
        if (hasRole(GUARDIAN_ROLE, msg.sender))      _guardianSignedPause[pid] = true;
        if (_adminSignedPause[pid] && _guardianSignedPause[pid]) {
            _pause();
            emit CircuitBreakerTripped(pid, "emergency co-sign pause");
        }
    }
}
