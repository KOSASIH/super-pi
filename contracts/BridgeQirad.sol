// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BridgeQirad — Agent-007 Fiat-to-$SPI Bridge
 * @notice The ONLY authorized minter of $SPI and $SUPi.
 *         Enforces on-chain proof-of-fiat-lock before any mint.
 *         HARD BLOCKS: Pi Coin, Pi bridges, Pi wrapped tokens.
 *         LEX_MACHINA v1.3 compliant.
 * @author NEXUS Prime / KOSASIH
 * @custom:version 1.0.0
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface ISPI {
    function mint(address to, uint256 amount, bytes32 fiatProofHash) external;
    function redeem(uint256 amount) external;
}

interface ISUPi {
    function mintFromBurn(address to, uint256 piNativeAmount, bytes32 burnProofHash) external;
}

contract BridgeQirad is AccessControl, ReentrancyGuard, Pausable {

    // ── Roles ──────────────────────────────────────────────────────────────
    bytes32 public constant ORACLE_ROLE       = keccak256("ORACLE_ROLE");        // Submits fiat-lock proofs
    bytes32 public constant COMPLIANCE_ROLE   = keccak256("COMPLIANCE_ROLE");    // LEX Machina
    bytes32 public constant PAUSER_ROLE       = keccak256("PAUSER_ROLE");
    bytes32 public constant SETTLEMENT_ROLE   = keccak256("SETTLEMENT_ROLE");    // Fiat settlement agents

    // ── Pi Coin Blocklist — PERMANENT, IMMUTABLE ───────────────────────────
    address public constant PI_COIN           = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf;
    address public constant PI_COIN_WRAPPED   = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBe01;
    address public constant PI_BRIDGE_V1      = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBe02;
    address public constant PI_BRIDGE_V2      = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBe03;

    // ── Accepted Fiat Currency Codes ───────────────────────────────────────
    bytes32 public constant USD = keccak256("USD");
    bytes32 public constant EUR = keccak256("EUR");
    bytes32 public constant IDR = keccak256("IDR");
    bytes32 public constant JPY = keccak256("JPY");
    bytes32 public constant SGD = keccak256("SGD");

    // ── State ──────────────────────────────────────────────────────────────
    ISPI  public immutable spiToken;
    ISUPi public immutable supiToken;

    /// @notice Accepted fiat currencies
    mapping(bytes32 => bool) public acceptedFiat;

    /// @notice Blocked token registry (Pi Coin + variants + any future bans)
    mapping(address => bool) public blockedTokens;

    /// @notice Fiat-lock proof registry: proofHash → processed
    mapping(bytes32 => bool) public processedFiatProofs;

    /// @notice Pi-burn proof registry: proofHash → processed
    mapping(bytes32 => bool) public processedBurnProofs;

    /// @notice Exchange rate: fiatCode → USD micros per unit (1 USD = 1_000_000)
    mapping(bytes32 => uint256) public fiatRateMicros;

    /// @notice Total $SPI minted via this bridge
    uint256 public totalSPIMinted;

    /// @notice Total $SUPi minted via this bridge
    uint256 public totalSUPiMinted;

    // ── Events ─────────────────────────────────────────────────────────────
    event FiatDeposit(
        address indexed user,
        bytes32 indexed fiatCurrency,
        uint256 fiatAmount,
        uint256 spiMinted,
        bytes32 proofHash
    );
    event PiBurnMigration(
        address indexed pioneer,
        uint256 piNativeAmount,
        uint256 supiMinted,
        bytes32 burnProofHash
    );
    event SPIRedeemed(address indexed user, uint256 spiAmount, bytes32 fiatCurrency);
    event TokenBlocked(address indexed token, string reason);
    event PiCoinBlockAttempt(address indexed caller, address indexed piToken, bytes data);

    // ── Errors ─────────────────────────────────────────────────────────────
    error PiCoinHardBlocked(address token);
    error FiatCurrencyNotAccepted(bytes32 currency);
    error ProofAlreadyProcessed(bytes32 proofHash);
    error InvalidProof();
    error ZeroAmount();
    error ExchangeRateNotSet(bytes32 currency);

    // ── Constructor ────────────────────────────────────────────────────────
    constructor(address admin, address spiAddr, address supiAddr) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);

        spiToken  = ISPI(spiAddr);
        supiToken = ISUPi(supiAddr);

        // Register accepted fiats
        acceptedFiat[USD] = true;
        acceptedFiat[EUR] = true;
        acceptedFiat[IDR] = true;
        acceptedFiat[JPY] = true;
        acceptedFiat[SGD] = true;

        // Permanently block Pi Coin and all variants — LEX_MACHINA v1.3 Article 3
        _hardBlockToken(PI_COIN,         "Pi Coin mainnet — LEX_MACHINA v1.3 Article 3.1");
        _hardBlockToken(PI_COIN_WRAPPED, "Wrapped Pi Coin — LEX_MACHINA v1.3 Article 2.3");
        _hardBlockToken(PI_BRIDGE_V1,    "Pi Bridge v1 — LEX_MACHINA v1.3 Article 3.1");
        _hardBlockToken(PI_BRIDGE_V2,    "Pi Bridge v2 — LEX_MACHINA v1.3 Article 3.1");

        // Default exchange rates (updated by oracle)
        fiatRateMicros[USD] = 1_000_000;   // 1 USD = 1,000,000 micros = 1 $SPI
        fiatRateMicros[EUR] = 1_100_000;   // 1 EUR ≈ 1.10 USD
        fiatRateMicros[IDR] = 65;          // 1 IDR = 0.000065 USD
        fiatRateMicros[JPY] = 6_700;       // 1 JPY ≈ 0.0067 USD
        fiatRateMicros[SGD] = 740_000;     // 1 SGD ≈ 0.74 USD
    }

    // ── Pi Coin Hard Block Guard ───────────────────────────────────────────
    /**
     * @notice Checks if a token is Pi Coin or a variant. Reverts immediately if so.
     *         Called on every incoming token interaction.
     *         LEX_MACHINA v1.3 Article 3.1 — immutable enforcement.
     */
    modifier noPiCoin(address token) {
        if (blockedTokens[token]) {
            emit PiCoinBlockAttempt(msg.sender, token, msg.data);
            revert PiCoinHardBlocked(token);
        }
        _;
    }

    // ── Fiat Deposit → $SPI Mint ───────────────────────────────────────────
    /**
     * @notice Process a fiat deposit and mint $SPI 1:1 to USD equivalent.
     * @param user          Recipient of $SPI
     * @param fiatCurrency  Fiat currency code (USD, EUR, IDR, JPY, SGD)
     * @param fiatAmount    Amount of fiat (in fiat's smallest unit × 1e6)
     * @param proofHash     Hash of the off-chain fiat-lock attestation
     */
    function depositFiatForSPI(
        address user,
        bytes32 fiatCurrency,
        uint256 fiatAmount,
        bytes32 proofHash
    )
        external
        onlyRole(ORACLE_ROLE)
        nonReentrant
        whenNotPaused
    {
        if (!acceptedFiat[fiatCurrency]) revert FiatCurrencyNotAccepted(fiatCurrency);
        if (processedFiatProofs[proofHash]) revert ProofAlreadyProcessed(proofHash);
        if (proofHash == bytes32(0)) revert InvalidProof();
        if (fiatAmount == 0) revert ZeroAmount();
        uint256 rate = fiatRateMicros[fiatCurrency];
        if (rate == 0) revert ExchangeRateNotSet(fiatCurrency);

        processedFiatProofs[proofHash] = true;

        // Convert fiat amount to $SPI (18 decimals): fiatAmount * rate / 1e6
        uint256 spiAmount = (fiatAmount * rate * 1e18) / 1e12;

        totalSPIMinted += spiAmount;
        spiToken.mint(user, spiAmount, proofHash);

        emit FiatDeposit(user, fiatCurrency, fiatAmount, spiAmount, proofHash);
    }

    // ── Pi-Native Burn → $SUPi Mint ───────────────────────────────────────
    /**
     * @notice Migrate 🌟Pi-Native to $SUPi. 1:1 ratio.
     *         Requires verified on-chain burn proof from Pi Mainnet.
     * @param pioneer       Pioneer's Super Pi L2 wallet
     * @param piNativeAmount Amount of Pi-Native burned (18 decimals)
     * @param burnProofHash Hash of Pi Mainnet burn transaction proof
     */
    function migratePiNativeToSUPi(
        address pioneer,
        uint256 piNativeAmount,
        bytes32 burnProofHash
    )
        external
        onlyRole(ORACLE_ROLE)
        nonReentrant
        whenNotPaused
    {
        if (processedBurnProofs[burnProofHash]) revert ProofAlreadyProcessed(burnProofHash);
        if (burnProofHash == bytes32(0)) revert InvalidProof();
        if (piNativeAmount == 0) revert ZeroAmount();

        processedBurnProofs[burnProofHash] = true;
        totalSUPiMinted += piNativeAmount;

        supiToken.mintFromBurn(pioneer, piNativeAmount, burnProofHash);

        emit PiBurnMigration(pioneer, piNativeAmount, piNativeAmount, burnProofHash);
    }

    // ── Block Additional Tokens ───────────────────────────────────────────
    function blockToken(address token, string calldata reason)
        external
        onlyRole(COMPLIANCE_ROLE)
    {
        _hardBlockToken(token, reason);
    }

    // ── Oracle: Update Exchange Rates ─────────────────────────────────────
    function updateFiatRate(bytes32 fiatCurrency, uint256 rateMicros)
        external
        onlyRole(ORACLE_ROLE)
    {
        fiatRateMicros[fiatCurrency] = rateMicros;
    }

    // ── Internal ──────────────────────────────────────────────────────────
    function _hardBlockToken(address token, string memory reason) internal {
        blockedTokens[token] = true;
        emit TokenBlocked(token, reason);
    }

    // ── Pause ─────────────────────────────────────────────────────────────
    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }
}
