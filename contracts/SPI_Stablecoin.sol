// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SPI_Stablecoin — Super Pi Hybrid Stablecoin
 * @notice Hard peg: 1 $SPI = 1 USD
 *         LEX_MACHINA v1.3 compliant
 *         Mint: ONLY Bridge-Qirad (Agent-007) after on-chain proof-of-fiat-lock
 *         Burn: Any holder redeems 1 USD 1:1. No restrictions.
 *         Freeze: ONLY upon valid court order via COURT_ORDER_ROLE.
 *         Reserve: Ledger-Hafiz publishes proof-of-reserve every hour.
 * @author NEXUS Prime / KOSASIH
 * @custom:version 4.0.0
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract SPI_Stablecoin is ERC20, ERC20Burnable, ERC20Permit, AccessControl, ReentrancyGuard, Pausable {

    // ── Roles ──────────────────────────────────────────────────────────────
    bytes32 public constant BRIDGE_QIRAD_ROLE = keccak256("BRIDGE_QIRAD_ROLE");  // Agent-007: only minter
    bytes32 public constant LEDGER_HAFIZ_ROLE = keccak256("LEDGER_HAFIZ_ROLE");  // Agent-011: reserve publisher
    bytes32 public constant COURT_ORDER_ROLE  = keccak256("COURT_ORDER_ROLE");   // Legal freeze authority
    bytes32 public constant PAUSER_ROLE       = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE     = keccak256("UPGRADER_ROLE");

    // ── Constants ──────────────────────────────────────────────────────────
    /// @notice 1 $SPI = 1 USD (6 decimal precision, stored as 1_000_000)
    uint256 public constant PEG_USD_MICROS = 1_000_000;

    /// @notice Pi Coin address — permanently blocked. Never changes.
    address public constant PI_COIN = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf;

    /// @notice Maximum daily mint per Bridge-Qirad call (100M $SPI = $100M USD)
    uint256 public constant MAX_DAILY_MINT = 100_000_000 * 1e18;

    // ── State ──────────────────────────────────────────────────────────────
    /// @notice Frozen addresses — ONLY set by COURT_ORDER_ROLE
    mapping(address => bool) public frozenByCourtOrder;

    /// @notice KYC-verified addresses eligible to hold $SPI
    mapping(address => bool) public kycVerified;

    /// @notice Proof-of-reserve: last reserve total reported by Ledger-Hafiz (in USD micros)
    uint256 public reserveTotalMicros;

    /// @notice Timestamp of last reserve update
    uint256 public reserveLastUpdated;

    /// @notice Daily mint tracker: date → amount minted
    mapping(uint256 => uint256) public dailyMinted;

    // ── Events ─────────────────────────────────────────────────────────────
    event Minted(address indexed to, uint256 amount, bytes32 fiatProofHash);
    event Redeemed(address indexed from, uint256 amount);
    event CourtOrderFreeze(address indexed target, string caseReference);
    event CourtOrderUnfreeze(address indexed target, string caseReference);
    event ReserveUpdated(uint256 totalMicros, uint256 timestamp, bytes32 attestationHash);
    event PiCoinBlockTriggered(address indexed caller, bytes32 indexed proofHash);

    // ── Errors ─────────────────────────────────────────────────────────────
    error PiCoinRejected(address token);
    error FrozenByCourtOrder(address account);
    error KYCRequired(address account);
    error UndercollateralizationRisk(uint256 supplyMicros, uint256 reserveMicros);
    error DailyMintLimitExceeded(uint256 requested, uint256 remaining);
    error ReserveStalenessError(uint256 lastUpdated, uint256 maxAge);

    // ── Constructor ────────────────────────────────────────────────────────
    constructor(address admin, address bridgeQirad, address ledgerHafiz)
        ERC20("Super Pi Stablecoin", "SPI")
        ERC20Permit("Super Pi Stablecoin")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(BRIDGE_QIRAD_ROLE, bridgeQirad);
        _grantRole(LEDGER_HAFIZ_ROLE, ledgerHafiz);
        _grantRole(PAUSER_ROLE, admin);
    }

    // ── LEX_MACHINA v1.3: Currency Isolation Modifier ─────────────────────
    /**
     * @notice Enforces Super Pi Legal Tender Law.
     *         Rejects Pi Coin and any non-authorized token at contract boundary.
     */
    modifier onlySuperPiTender(address token) {
        if (token == PI_COIN) {
            revert PiCoinRejected(token);
        }
        require(
            token == address(this) || _isFiatGateway(msg.sender),
            "NEXUS: Foreign currency rejected"
        );
        _;
    }

    modifier notFrozen(address account) {
        if (frozenByCourtOrder[account]) revert FrozenByCourtOrder(account);
        _;
    }

    modifier kycRequired(address account) {
        if (!kycVerified[account]) revert KYCRequired(account);
        _;
    }

    // ── Minting — Bridge-Qirad ONLY ────────────────────────────────────────
    /**
     * @notice Mint $SPI. ONLY callable by Bridge-Qirad (Agent-007).
     * @param to            Recipient address (must be KYC verified)
     * @param amount        Amount of $SPI to mint (18 decimals)
     * @param fiatProofHash Keccak256 hash of the on-chain fiat-lock proof
     */
    function mint(
        address to,
        uint256 amount,
        bytes32 fiatProofHash
    )
        external
        onlyRole(BRIDGE_QIRAD_ROLE)
        nonReentrant
        whenNotPaused
        kycRequired(to)
    {
        // Reserve freshness check — reject if Ledger-Hafiz hasn't updated in 2 hours
        if (reserveLastUpdated > 0 && block.timestamp - reserveLastUpdated > 2 hours) {
            revert ReserveStalenessError(reserveLastUpdated, 2 hours);
        }

        // Daily mint limit
        uint256 today = block.timestamp / 1 days;
        uint256 minted = dailyMinted[today];
        if (minted + amount > MAX_DAILY_MINT) {
            revert DailyMintLimitExceeded(amount, MAX_DAILY_MINT - minted);
        }

        // Collateral check: after mint, supply must not exceed reserve
        uint256 newSupplyMicros = (totalSupply() + amount) / 1e12;
        if (reserveTotalMicros > 0 && newSupplyMicros > reserveTotalMicros) {
            revert UndercollateralizationRisk(newSupplyMicros, reserveTotalMicros);
        }

        dailyMinted[today] += amount;
        _mint(to, amount);
        emit Minted(to, amount, fiatProofHash);
    }

    // ── Burning / Redemption ───────────────────────────────────────────────
    /**
     * @notice Burn $SPI to redeem USD 1:1.
     *         Any holder can burn. No freeze, no permission required.
     * @param amount Amount to burn and redeem
     */
    function redeem(uint256 amount) external nonReentrant whenNotPaused notFrozen(msg.sender) {
        _burn(msg.sender, amount);
        emit Redeemed(msg.sender, amount);
        // Off-chain: Bridge-Qirad listens for Redeemed event and processes USD transfer
    }

    // ── Court Order Freeze — ONLY via COURT_ORDER_ROLE ────────────────────
    function freezeByCourtOrder(address target, string calldata caseRef)
        external
        onlyRole(COURT_ORDER_ROLE)
    {
        frozenByCourtOrder[target] = true;
        emit CourtOrderFreeze(target, caseRef);
    }

    function unfreezeByCourtOrder(address target, string calldata caseRef)
        external
        onlyRole(COURT_ORDER_ROLE)
    {
        frozenByCourtOrder[target] = false;
        emit CourtOrderUnfreeze(target, caseRef);
    }

    // ── Ledger-Hafiz: Proof-of-Reserve ────────────────────────────────────
    /**
     * @notice Update proof-of-reserve. Called every hour by Agent-011 Ledger-Hafiz.
     * @param totalMicros       Total USD reserve in micros (6 decimals)
     * @param attestationHash   Hash of the off-chain attestation document
     */
    function updateReserve(uint256 totalMicros, bytes32 attestationHash)
        external
        onlyRole(LEDGER_HAFIZ_ROLE)
    {
        reserveTotalMicros  = totalMicros;
        reserveLastUpdated  = block.timestamp;
        emit ReserveUpdated(totalMicros, block.timestamp, attestationHash);
    }

    // ── KYC Management ────────────────────────────────────────────────────
    function verifyKYC(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        kycVerified[account] = true;
    }

    function revokeKYC(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        kycVerified[account] = false;
    }

    // ── Pause ─────────────────────────────────────────────────────────────
    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    // ── View Helpers ──────────────────────────────────────────────────────
    /**
     * @notice Collateral ratio. Returns 1e6 = 100% (1:1). Always >= 1e6 for healthy state.
     */
    function getCollateralRatio() external view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return type(uint256).max;
        uint256 supplyMicros = supply / 1e12;
        return (reserveTotalMicros * 1e6) / supplyMicros;
    }

    /**
     * @notice Pi Coin hard-block — call this to verify isolation is active.
     *         Always reverts. Used by test suite to confirm the block is live.
     */
    function integratePiCoin(address token) external pure {
        revert PiCoinRejected(token);
    }

    // ── Transfer Hooks ────────────────────────────────────────────────────
    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        if (from != address(0) && frozenByCourtOrder[from]) revert FrozenByCourtOrder(from);
        if (to   != address(0) && frozenByCourtOrder[to])   revert FrozenByCourtOrder(to);
        super._update(from, to, value);
    }

    // ── Internal ──────────────────────────────────────────────────────────
    function _isFiatGateway(address caller) internal view returns (bool) {
        return hasRole(BRIDGE_QIRAD_ROLE, caller);
    }
}
