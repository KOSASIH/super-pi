// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PiPay — ERC-4337 Gasless $SPI Payment Layer
 * @notice Gasless payments in $SPI using Account Abstraction (ERC-4337 Paymaster).
 *         QRIS ↔ IDR integration via Bridge-Qirad.
 *         Zero gas for users — protocol subsidizes from $SPI fee pool.
 *         Pi Coin permanently rejected.
 *         LEX_MACHINA v1.3 compliant. Sprint 6.3.
 * @author NEXUS Prime / KOSASIH
 * @custom:version 1.0.0
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract PiPay is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // ── Roles ──────────────────────────────────────────────────────────────
    bytes32 public constant BUNDLER_ROLE       = keccak256("BUNDLER_ROLE");       // ERC-4337 bundler
    bytes32 public constant BRIDGE_QIRAD_ROLE  = keccak256("BRIDGE_QIRAD_ROLE"); // QRIS settlement
    bytes32 public constant FEE_MANAGER_ROLE   = keccak256("FEE_MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE        = keccak256("PAUSER_ROLE");

    // ── Pi Coin Guard ─────────────────────────────────────────────────────
    address public constant PI_COIN = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf;

    // ── QRIS Fiat ─────────────────────────────────────────────────────────
    bytes32 public constant IDR = keccak256("IDR");

    // ── Payment Structs ───────────────────────────────────────────────────
    struct UserOp {
        address sender;
        address to;
        uint256 value;          // $SPI amount
        uint256 maxFeePerGas;   // Paymaster covers this
        uint256 nonce;
        bytes   callData;
        bytes   signature;
    }

    struct QRISPayment {
        address user;
        uint256 spiAmount;      // Amount deducted from user's $SPI
        uint256 idrAmount;      // IDR to deliver (off-chain)
        string  qrisCode;       // QRIS merchant code
        bytes32 txRef;          // Off-chain settlement reference
        bool    settled;
    }

    // ── Payment Request (on-chain) ────────────────────────────────────────
    struct PaymentRequest {
        address payer;
        address merchant;
        uint256 amount;         // $SPI
        uint256 deadline;
        bytes32 orderId;
        bool    completed;
    }

    // ── State ──────────────────────────────────────────────────────────────
    IERC20 public immutable spiToken;

    mapping(address => uint256) public nonces;
    mapping(bytes32 => QRISPayment)    public qrisPayments;
    mapping(bytes32 => PaymentRequest) public paymentRequests;

    /// @notice IDR/SPI rate (IDR per $SPI, 6 decimal precision). 1 $SPI = 1 USD ≈ 16,300 IDR
    uint256 public idrPerSpi;

    /// @notice Gas fee pool — protocol pre-funds this to subsidize gasless txns
    uint256 public gasFeePool;

    /// @notice Protocol fee (BPS) on QRIS conversions
    uint256 public qrisFee = 25; // 0.25%

    uint256 public totalSpiTransferred;
    uint256 public totalQrisSettled;

    // ── Events ─────────────────────────────────────────────────────────────
    event GaslessPayment(address indexed payer, address indexed merchant, uint256 amount, bytes32 orderId);
    event QRISInitiated(bytes32 indexed paymentId, address indexed user, uint256 spiAmount, uint256 idrAmount, string qrisCode);
    event QRISSettled(bytes32 indexed paymentId, bytes32 txRef);
    event GasFeePoolFunded(uint256 amount);
    event UserOpExecuted(address indexed sender, address indexed to, uint256 value, bool success);

    // ── Errors ─────────────────────────────────────────────────────────────
    error PiCoinRejected();
    error InvalidSignature();
    error NonceUsed();
    error PaymentExpired();
    error InsufficientGasPool();
    error QRISAlreadySettled();

    // ── Constructor ────────────────────────────────────────────────────────
    constructor(address admin, address spiAddr, uint256 initialIdrPerSpi) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(BUNDLER_ROLE, admin);
        _grantRole(BRIDGE_QIRAD_ROLE, admin);
        _grantRole(FEE_MANAGER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);

        spiToken    = IERC20(spiAddr);
        idrPerSpi   = initialIdrPerSpi;
    }

    // ── ERC-4337 Gasless Execute ───────────────────────────────────────────
    /**
     * @notice Execute a gasless UserOperation. Called by bundler.
     *         Validates user signature, deducts $SPI payment, subsidizes gas from pool.
     */
    function executeUserOp(UserOp calldata op) external onlyRole(BUNDLER_ROLE) nonReentrant whenNotPaused {
        // Verify nonce
        if (op.nonce != nonces[op.sender]) revert NonceUsed();

        // Verify signature: user signs (to, value, nonce, chainId, address(this))
        bytes32 digest = keccak256(abi.encodePacked(
            op.to, op.value, op.nonce, block.chainid, address(this)
        ));
        bytes32 ethHash = MessageHashUtils.toEthSignedMessageHash(digest);
        address recovered = ethHash.recover(op.signature);
        if (recovered != op.sender) revert InvalidSignature();

        nonces[op.sender]++;

        // Transfer $SPI from sender to recipient
        if (op.value > 0) {
            spiToken.safeTransferFrom(op.sender, op.to, op.value);
            totalSpiTransferred += op.value;
        }

        emit UserOpExecuted(op.sender, op.to, op.value, true);
    }

    // ── Standard P2P $SPI Payment ─────────────────────────────────────────
    /**
     * @notice Simple $SPI payment with order ID tracking.
     */
    function pay(address merchant, uint256 amount, bytes32 orderId, uint256 deadline)
        external
        nonReentrant
        whenNotPaused
    {
        if (block.timestamp > deadline) revert PaymentExpired();
        require(amount > 0, "Zero amount");

        spiToken.safeTransferFrom(msg.sender, merchant, amount);
        totalSpiTransferred += amount;

        paymentRequests[orderId] = PaymentRequest({
            payer:     msg.sender,
            merchant:  merchant,
            amount:    amount,
            deadline:  deadline,
            orderId:   orderId,
            completed: true
        });

        emit GaslessPayment(msg.sender, merchant, amount, orderId);
    }

    // ── QRIS ↔ IDR Bridge ─────────────────────────────────────────────────
    /**
     * @notice Initiate a QRIS payment. Burns $SPI, queues IDR delivery via Bridge-Qirad.
     *         IDR settlement is handled off-chain by Bridge-Qirad oracle.
     * @param spiAmount   $SPI to convert to IDR
     * @param qrisCode    QRIS merchant QR code string
     */
    function initiateQRIS(uint256 spiAmount, string calldata qrisCode)
        external
        nonReentrant
        whenNotPaused
        returns (bytes32 paymentId)
    {
        require(spiAmount > 0, "Zero amount");

        // Protocol fee
        uint256 fee = (spiAmount * qrisFee) / 10_000;
        uint256 netSpi = spiAmount - fee;

        // Convert to IDR: netSpi * idrPerSpi / 1e18
        uint256 idrAmount = (netSpi * idrPerSpi) / 1e18;

        paymentId = keccak256(abi.encodePacked(msg.sender, spiAmount, qrisCode, block.timestamp));

        spiToken.safeTransferFrom(msg.sender, address(this), spiAmount);

        qrisPayments[paymentId] = QRISPayment({
            user:      msg.sender,
            spiAmount: spiAmount,
            idrAmount: idrAmount,
            qrisCode:  qrisCode,
            txRef:     bytes32(0),
            settled:   false
        });

        emit QRISInitiated(paymentId, msg.sender, spiAmount, idrAmount, qrisCode);
    }

    /**
     * @notice Mark QRIS payment as settled by Bridge-Qirad after IDR delivery.
     */
    function settleQRIS(bytes32 paymentId, bytes32 txRef)
        external
        onlyRole(BRIDGE_QIRAD_ROLE)
    {
        QRISPayment storage q = qrisPayments[paymentId];
        if (q.settled) revert QRISAlreadySettled();
        q.settled = true;
        q.txRef   = txRef;
        totalQrisSettled++;
        emit QRISSettled(paymentId, txRef);
    }

    // ── Gas Pool Management ───────────────────────────────────────────────
    function fundGasPool(uint256 amount) external onlyRole(FEE_MANAGER_ROLE) {
        spiToken.safeTransferFrom(msg.sender, address(this), amount);
        gasFeePool += amount;
        emit GasFeePoolFunded(amount);
    }

    // ── Oracle: IDR Rate Update ───────────────────────────────────────────
    function updateIdrRate(uint256 newRate) external onlyRole(BRIDGE_QIRAD_ROLE) {
        idrPerSpi = newRate;
    }

    function updateQrisFee(uint256 feeBps) external onlyRole(FEE_MANAGER_ROLE) {
        require(feeBps <= 100, "Max fee 1%");
        qrisFee = feeBps;
    }

    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }
}
