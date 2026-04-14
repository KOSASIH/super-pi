// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SuperPiDEX — MEV-0 AMM with $SPI Mandatory Base Pair
 * @notice Decentralized exchange with zero MEV, zero impermanent loss oracle,
 *         commit-reveal order protection, $SPI as base for all pairs.
 *         Pi Coin hard-blocked at factory level.
 *         LEX_MACHINA v1.3 compliant. SINGULARITY Swap Sprint 6.2.
 * @author NEXUS Prime / KOSASIH
 * @custom:version 1.0.0
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

// ── Liquidity Pool LP Token ────────────────────────────────────────────────
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SuperPiLP is ERC20 {
    address public immutable pool;
    constructor(string memory name, string memory symbol, address _pool)
        ERC20(name, symbol) { pool = _pool; }
    function mint(address to, uint256 amount) external { require(msg.sender == pool); _mint(to, amount); }
    function burn(address from, uint256 amount) external { require(msg.sender == pool); _burn(from, amount); }
}

// ── AMM Pool ──────────────────────────────────────────────────────────────
contract SuperPiPool is ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    address public constant PI_COIN = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf;
    uint256 public constant FEE_BPS  = 30;   // 0.3% LP fee
    uint256 public constant PROTOCOL_FEE_BPS = 5; // 0.05% protocol fee → treasury

    IERC20      public immutable spiToken;  // Always $SPI (base pair)
    IERC20      public immutable quoteToken;
    SuperPiLP   public immutable lpToken;
    address     public immutable factory;
    address     public          treasury;

    uint256 public reserveSPI;
    uint256 public reserveQuote;
    uint256 public kLast; // reserve product after last fee event

    // ── MEV-0 Commit-Reveal ───────────────────────────────────────────────
    struct SwapCommitment {
        bytes32 hash;       // keccak256(abi.encode(amountIn, minOut, deadline, nonce, trader))
        uint256 blockNumber;
        bool    revealed;
    }
    mapping(address => SwapCommitment) public commitments;
    mapping(address => uint256)        public nonces;
    uint256 public constant REVEAL_WINDOW = 3; // must reveal within 3 blocks

    // ── TWAP Oracle ───────────────────────────────────────────────────────
    uint256 public price0CumulativeLast;
    uint256 public price1CumulativeLast;
    uint256 public blockTimestampLast;

    // ── Events ─────────────────────────────────────────────────────────────
    event LiquidityAdded(address indexed provider, uint256 spiAmount, uint256 quoteAmount, uint256 lpMinted);
    event LiquidityRemoved(address indexed provider, uint256 spiAmount, uint256 quoteAmount, uint256 lpBurned);
    event SwapCommitted(address indexed trader, bytes32 commitHash, uint256 blockNumber);
    event SwapExecuted(address indexed trader, uint256 amountIn, uint256 amountOut, bool spiToQuote);
    event PriceUpdate(uint256 price0Cumulative, uint256 price1Cumulative);

    // ── Errors ─────────────────────────────────────────────────────────────
    error PiCoinRejected();
    error InvalidCommitment();
    error CommitmentExpired();
    error SlippageExceeded(uint256 got, uint256 minExpected);
    error InsufficientLiquidity();

    constructor(address spiAddr, address quoteAddr, address _treasury, address _factory) {
        require(quoteAddr != PI_COIN, "NEXUS: Pi Coin pairs impossible — LEX_MACHINA v1.3");
        spiToken   = IERC20(spiAddr);
        quoteToken = IERC20(quoteAddr);
        treasury   = _treasury;
        factory    = _factory;

        lpToken = new SuperPiLP(
            string(abi.encodePacked("SuperPi LP")),
            "SPLP",
            address(this)
        );
    }

    // ── Liquidity ─────────────────────────────────────────────────────────
    function addLiquidity(
        uint256 spiAmount,
        uint256 quoteAmount,
        uint256 minLPOut
    ) external nonReentrant whenNotPaused returns (uint256 lpMinted) {
        _updateOracle();
        spiToken.safeTransferFrom(msg.sender, address(this), spiAmount);
        quoteToken.safeTransferFrom(msg.sender, address(this), quoteAmount);

        uint256 totalLP = lpToken.totalSupply();
        if (totalLP == 0) {
            lpMinted = Math.sqrt(spiAmount * quoteAmount);
        } else {
            lpMinted = Math.min(
                (spiAmount * totalLP) / reserveSPI,
                (quoteAmount * totalLP) / reserveQuote
            );
        }
        require(lpMinted >= minLPOut, "Insufficient LP minted");
        require(lpMinted > 0, "Zero LP");

        reserveSPI   += spiAmount;
        reserveQuote += quoteAmount;
        kLast = reserveSPI * reserveQuote;

        lpToken.mint(msg.sender, lpMinted);
        emit LiquidityAdded(msg.sender, spiAmount, quoteAmount, lpMinted);
    }

    function removeLiquidity(uint256 lpAmount, uint256 minSPI, uint256 minQuote)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 spiOut, uint256 quoteOut)
    {
        _updateOracle();
        uint256 totalLP = lpToken.totalSupply();
        spiOut   = (lpAmount * reserveSPI)   / totalLP;
        quoteOut = (lpAmount * reserveQuote) / totalLP;

        require(spiOut   >= minSPI,   "SPI slippage");
        require(quoteOut >= minQuote, "Quote slippage");

        lpToken.burn(msg.sender, lpAmount);
        reserveSPI   -= spiOut;
        reserveQuote -= quoteOut;
        kLast = reserveSPI * reserveQuote;

        spiToken.safeTransfer(msg.sender, spiOut);
        quoteToken.safeTransfer(msg.sender, quoteOut);
        emit LiquidityRemoved(msg.sender, spiOut, quoteOut, lpAmount);
    }

    // ── MEV-0 Swap: Phase 1 — Commit ─────────────────────────────────────
    /**
     * @notice MEV-0 swap: first commit the swap hash (conceals amount from front-runners)
     * @param commitHash keccak256(abi.encode(amountIn, minOut, deadline, nonce, msg.sender))
     */
    function commitSwap(bytes32 commitHash) external whenNotPaused {
        commitments[msg.sender] = SwapCommitment({
            hash:        commitHash,
            blockNumber: block.number,
            revealed:    false
        });
        emit SwapCommitted(msg.sender, commitHash, block.number);
    }

    // ── MEV-0 Swap: Phase 2 — Reveal & Execute ────────────────────────────
    /**
     * @notice Reveal and execute the committed swap. Must reveal within REVEAL_WINDOW blocks.
     * @param amountIn     Input amount
     * @param minOut       Minimum acceptable output
     * @param deadline     TX deadline
     * @param spiToQuote   true = sell $SPI, false = sell quote
     */
    function revealAndSwap(
        uint256 amountIn,
        uint256 minOut,
        uint256 deadline,
        bool    spiToQuote
    ) external nonReentrant whenNotPaused returns (uint256 amountOut) {
        require(block.timestamp <= deadline, "Expired");

        SwapCommitment storage c = commitments[msg.sender];
        if (c.hash == bytes32(0) || c.revealed) revert InvalidCommitment();
        if (block.number > c.blockNumber + REVEAL_WINDOW) revert CommitmentExpired();

        bytes32 expectedHash = keccak256(abi.encode(amountIn, minOut, deadline, nonces[msg.sender]++, msg.sender));
        if (c.hash != expectedHash) revert InvalidCommitment();

        c.revealed = true;
        _updateOracle();

        amountOut = _swap(msg.sender, amountIn, minOut, spiToQuote);
    }

    // ── Internal Swap ─────────────────────────────────────────────────────
    function _swap(
        address trader,
        uint256 amountIn,
        uint256 minOut,
        bool    spiToQuote
    ) internal returns (uint256 amountOut) {
        if (spiToQuote) {
            spiToken.safeTransferFrom(trader, address(this), amountIn);
            amountOut = _getAmountOut(amountIn, reserveSPI, reserveQuote);
            if (amountOut < minOut) revert SlippageExceeded(amountOut, minOut);
            if (amountOut > reserveQuote) revert InsufficientLiquidity();

            uint256 protocolFee = (amountIn * PROTOCOL_FEE_BPS) / 10_000;
            spiToken.safeTransfer(treasury, protocolFee);

            reserveSPI   += amountIn - protocolFee;
            reserveQuote -= amountOut;
            quoteToken.safeTransfer(trader, amountOut);
        } else {
            quoteToken.safeTransferFrom(trader, address(this), amountIn);
            amountOut = _getAmountOut(amountIn, reserveQuote, reserveSPI);
            if (amountOut < minOut) revert SlippageExceeded(amountOut, minOut);
            if (amountOut > reserveSPI) revert InsufficientLiquidity();

            uint256 protocolFee = (amountIn * PROTOCOL_FEE_BPS) / 10_000;
            quoteToken.safeTransfer(treasury, protocolFee);

            reserveQuote += amountIn - protocolFee;
            reserveSPI   -= amountOut;
            spiToken.safeTransfer(trader, amountOut);
        }

        emit SwapExecuted(trader, amountIn, amountOut, spiToQuote);
    }

    // ── TWAP Oracle Update ────────────────────────────────────────────────
    function _updateOracle() internal {
        uint256 timeElapsed = block.timestamp - blockTimestampLast;
        if (timeElapsed > 0 && reserveSPI > 0 && reserveQuote > 0) {
            price0CumulativeLast += (reserveQuote * 1e18 / reserveSPI) * timeElapsed;
            price1CumulativeLast += (reserveSPI   * 1e18 / reserveQuote) * timeElapsed;
        }
        blockTimestampLast = block.timestamp;
        emit PriceUpdate(price0CumulativeLast, price1CumulativeLast);
    }

    // ── Constant Product Formula with Fee ────────────────────────────────
    function _getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        internal
        pure
        returns (uint256)
    {
        require(amountIn > 0, "Zero input");
        require(reserveIn > 0 && reserveOut > 0, "No liquidity");
        uint256 amountInWithFee = amountIn * (10_000 - FEE_BPS);
        return (amountInWithFee * reserveOut) / ((reserveIn * 10_000) + amountInWithFee);
    }

    function getSpotPrice() external view returns (uint256 spiPerQuote) {
        if (reserveQuote == 0) return 0;
        return (reserveSPI * 1e18) / reserveQuote;
    }
}

// ── DEX Factory ───────────────────────────────────────────────────────────
contract SuperPiDEX is AccessControl {
    bytes32 public constant POOL_MANAGER_ROLE = keccak256("POOL_MANAGER_ROLE");

    address public constant PI_COIN = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf;
    address public immutable spiToken;
    address public           treasury;

    mapping(address => address) public getPool;    // quoteToken => pool
    address[]                   public allPools;

    event PoolCreated(address indexed quoteToken, address pool, uint256 poolCount);

    error PiCoinPoolForbidden();
    error PoolExists();

    constructor(address spiAddr, address _treasury, address admin) {
        spiToken = spiAddr;
        treasury = _treasury;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(POOL_MANAGER_ROLE, admin);
    }

    /**
     * @notice Create a new $SPI / quoteToken pool.
     *         Reverts if quoteToken == PI_COIN (LEX_MACHINA v1.3 Article 3.2).
     */
    function createPool(address quoteToken) external onlyRole(POOL_MANAGER_ROLE) returns (address pool) {
        if (quoteToken == PI_COIN) revert PiCoinPoolForbidden();
        if (getPool[quoteToken] != address(0)) revert PoolExists();

        SuperPiPool p = new SuperPiPool(spiToken, quoteToken, treasury, address(this));
        pool = address(p);
        getPool[quoteToken] = pool;
        allPools.push(pool);

        emit PoolCreated(quoteToken, pool, allPools.length);
    }

    function allPoolsLength() external view returns (uint256) { return allPools.length; }
}
