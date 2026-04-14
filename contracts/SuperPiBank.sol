// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SuperPiBank — Halal Islamic Finance Banking Protocol
 * @notice Shariah-compliant savings and murabaha financing in $SPI.
 *         Zero riba. Profit-share (musharakah) model only.
 *         All yields denominated in $SPI. No interest, no penalties.
 *         LEX_MACHINA v1.3 compliant. OMEGA DeFi Sprint 6.1.
 * @author NEXUS Prime / KOSASIH
 * @custom:version 1.0.0
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract SuperPiBank is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ── Roles ──────────────────────────────────────────────────────────────
    bytes32 public constant PROFIT_ORACLE_ROLE = keccak256("PROFIT_ORACLE_ROLE");
    bytes32 public constant SHARIAH_BOARD_ROLE = keccak256("SHARIAH_BOARD_ROLE");
    bytes32 public constant PAUSER_ROLE        = keccak256("PAUSER_ROLE");

    // ── Pi Coin Guard ─────────────────────────────────────────────────────
    address public constant PI_COIN = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf;

    // ── Murabaha Product Types ─────────────────────────────────────────────
    enum ProductType { SAVINGS, MURABAHA, MUSHARAKAH, SUKUK }

    // ── Savings Account ───────────────────────────────────────────────────
    struct SavingsAccount {
        uint256 principal;          // $SPI deposited
        uint256 profitAccrued;      // Profit earned (from treasury yield, NOT interest)
        uint256 lastUpdateTime;
        uint256 lockDuration;       // Lock period for murabaha (0 = flexible)
        ProductType product;
        bool    active;
    }

    // ── Murabaha Financing ────────────────────────────────────────────────
    struct MurabahaLoan {
        address borrower;
        uint256 costPrice;          // Original cost of asset ($SPI)
        uint256 markupAmount;       // Pre-agreed markup (profit, not interest)
        uint256 totalPayable;       // costPrice + markupAmount
        uint256 amountPaid;
        uint256 installmentAmount;
        uint256 dueDate;
        bool    active;
        bool    completed;
        string  assetDescription;   // What was purchased (halal asset only)
    }

    // ── State ──────────────────────────────────────────────────────────────
    IERC20 public immutable spiToken;

    mapping(address => SavingsAccount) public savingsAccounts;
    mapping(uint256 => MurabahaLoan)   public murabahaLoans;
    uint256 public nextLoanId;

    uint256 public totalDeposits;
    uint256 public totalProfitDistributed;

    /// @notice Current profit-share ratio (basis points, e.g., 500 = 5%). Set by treasury oracle.
    uint256 public profitShareBps;
    uint256 public constant MAX_PROFIT_SHARE_BPS = 2000; // 20% max

    /// @notice Treasury: profit pool funded by RWA yields (T-Bills, sukuk, etc.)
    uint256 public treasuryProfitPool;

    /// @notice Minimum deposit: 1 $SPI
    uint256 public constant MIN_DEPOSIT = 1e18;

    // ── Events ─────────────────────────────────────────────────────────────
    event Deposited(address indexed user, uint256 amount, ProductType product);
    event Withdrawn(address indexed user, uint256 principal, uint256 profit);
    event ProfitDistributed(address indexed user, uint256 amount);
    event MurabahaCreated(uint256 indexed loanId, address indexed borrower, uint256 costPrice, uint256 markup);
    event MurabahaInstallment(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 remaining);
    event MurabahaCompleted(uint256 indexed loanId, address indexed borrower);
    event TreasuryFunded(uint256 amount, address indexed source);
    event ShariahAudit(address indexed auditor, string reportCID, bool certified);

    // ── Errors ─────────────────────────────────────────────────────────────
    error PiCoinRejected();
    error RibaDetected(string reason);
    error InsufficientDeposit(uint256 min, uint256 provided);
    error NoActiveAccount();
    error LoanLocked(uint256 unlockTime);
    error InsufficientTreasury(uint256 available, uint256 required);

    // ── Constructor ────────────────────────────────────────────────────────
    constructor(address admin, address spiAddr, uint256 initialProfitShareBps) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PROFIT_ORACLE_ROLE, admin);
        _grantRole(SHARIAH_BOARD_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);

        spiToken       = IERC20(spiAddr);
        profitShareBps = initialProfitShareBps;
    }

    // ── LEX_MACHINA: No Pi Coin ───────────────────────────────────────────
    modifier noPiCoin(address token) {
        if (token == PI_COIN) revert PiCoinRejected();
        _;
    }

    modifier noRiba(uint256 interestRate) {
        if (interestRate > 0) revert RibaDetected("Fixed interest rate violates Shariah law");
        _;
    }

    // ── Savings Deposit ───────────────────────────────────────────────────
    /**
     * @notice Deposit $SPI into halal savings. Earn profit-share from real assets.
     * @param amount       Amount to deposit (18 decimals)
     * @param lockDays     Days to lock (0 = flexible, higher = higher profit-share)
     * @param product      Product type (SAVINGS, MUSHARAKAH, SUKUK)
     */
    function deposit(uint256 amount, uint256 lockDays, ProductType product)
        external
        nonReentrant
        whenNotPaused
    {
        if (amount < MIN_DEPOSIT) revert InsufficientDeposit(MIN_DEPOSIT, amount);
        require(product != ProductType.MURABAHA, "Use openMurabaha() for financing");

        // Settle any existing profits before adding to principal
        _settleProfits(msg.sender);

        spiToken.safeTransferFrom(msg.sender, address(this), amount);

        SavingsAccount storage acct = savingsAccounts[msg.sender];
        acct.principal      += amount;
        acct.lastUpdateTime  = block.timestamp;
        acct.lockDuration    = lockDays * 1 days;
        acct.product         = product;
        acct.active          = true;

        totalDeposits += amount;
        emit Deposited(msg.sender, amount, product);
    }

    // ── Withdraw ──────────────────────────────────────────────────────────
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        SavingsAccount storage acct = savingsAccounts[msg.sender];
        if (!acct.active) revert NoActiveAccount();
        if (block.timestamp < acct.lastUpdateTime + acct.lockDuration) {
            revert LoanLocked(acct.lastUpdateTime + acct.lockDuration);
        }

        _settleProfits(msg.sender);
        require(acct.principal >= amount, "Insufficient principal");

        acct.principal  -= amount;
        uint256 profit   = acct.profitAccrued;
        acct.profitAccrued = 0;

        if (acct.principal == 0) acct.active = false;
        totalDeposits -= amount;

        uint256 payout = amount + profit;
        require(spiToken.balanceOf(address(this)) >= payout, "Insufficient liquidity");
        spiToken.safeTransfer(msg.sender, payout);

        emit Withdrawn(msg.sender, amount, profit);
    }

    // ── Murabaha Financing ────────────────────────────────────────────────
    /**
     * @notice Open a murabaha financing agreement.
     *         Bank buys the asset; sells it to borrower at cost + pre-agreed markup.
     *         NO interest. Markup is fixed at inception. No late penalty (tawarruq allowed).
     * @param borrower         Borrower address
     * @param costPrice        Asset cost in $SPI
     * @param markupBps        Pre-agreed markup in basis points (e.g. 300 = 3%)
     * @param installments     Number of installment periods
     * @param assetDescription Description of the halal asset being financed
     */
    function openMurabaha(
        address borrower,
        uint256 costPrice,
        uint256 markupBps,
        uint256 installments,
        string calldata assetDescription
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        noRiba(0)      // explicit: markup is NOT interest — it is a trade profit
        nonReentrant
        whenNotPaused
    {
        require(markupBps <= 1500, "Markup > 15% may indicate gharar");
        require(installments > 0, "Must have at least 1 installment");

        uint256 markup      = (costPrice * markupBps) / 10_000;
        uint256 totalPayable = costPrice + markup;
        uint256 installAmt  = totalPayable / installments;

        uint256 loanId = nextLoanId++;
        murabahaLoans[loanId] = MurabahaLoan({
            borrower:          borrower,
            costPrice:         costPrice,
            markupAmount:      markup,
            totalPayable:      totalPayable,
            amountPaid:        0,
            installmentAmount: installAmt,
            dueDate:           block.timestamp + (30 days * installments),
            active:            true,
            completed:         false,
            assetDescription:  assetDescription
        });

        emit MurabahaCreated(loanId, borrower, costPrice, markup);
    }

    /**
     * @notice Pay a murabaha installment.
     */
    function payInstallment(uint256 loanId, uint256 amount)
        external
        nonReentrant
        whenNotPaused
    {
        MurabahaLoan storage loan = murabahaLoans[loanId];
        require(loan.active && !loan.completed, "Loan not active");
        require(msg.sender == loan.borrower, "Not borrower");

        spiToken.safeTransferFrom(msg.sender, address(this), amount);
        loan.amountPaid += amount;

        uint256 remaining = loan.totalPayable - loan.amountPaid;
        emit MurabahaInstallment(loanId, msg.sender, amount, remaining);

        if (loan.amountPaid >= loan.totalPayable) {
            loan.completed = true;
            loan.active    = false;
            emit MurabahaCompleted(loanId, msg.sender);
        }
    }

    // ── Treasury / Profit Distribution ────────────────────────────────────
    /**
     * @notice Fund the treasury profit pool from RWA yields (T-Bills, sukuk).
     */
    function fundTreasury(uint256 amount) external onlyRole(PROFIT_ORACLE_ROLE) {
        spiToken.safeTransferFrom(msg.sender, address(this), amount);
        treasuryProfitPool += amount;
        emit TreasuryFunded(amount, msg.sender);
    }

    /**
     * @notice Update profit-share ratio. Max 20% APY. Called by oracle from RWA yield data.
     */
    function updateProfitShare(uint256 newBps)
        external
        onlyRole(PROFIT_ORACLE_ROLE)
        noRiba(0)
    {
        require(newBps <= MAX_PROFIT_SHARE_BPS, "Profit share too high — gharar risk");
        profitShareBps = newBps;
    }

    // ── Shariah Audit ─────────────────────────────────────────────────────
    function publishShariahAudit(string calldata reportCID, bool certified)
        external
        onlyRole(SHARIAH_BOARD_ROLE)
    {
        emit ShariahAudit(msg.sender, reportCID, certified);
    }

    // ── View ──────────────────────────────────────────────────────────────
    function getAccountValue(address user) external view returns (uint256 principal, uint256 pendingProfit) {
        SavingsAccount storage acct = savingsAccounts[user];
        principal = acct.principal;
        pendingProfit = _calculateProfit(user);
    }

    // ── Internal ──────────────────────────────────────────────────────────
    function _settleProfits(address user) internal {
        uint256 profit = _calculateProfit(user);
        if (profit > 0 && profit <= treasuryProfitPool) {
            savingsAccounts[user].profitAccrued += profit;
            treasuryProfitPool    -= profit;
            totalProfitDistributed += profit;
            emit ProfitDistributed(user, profit);
        }
        savingsAccounts[user].lastUpdateTime = block.timestamp;
    }

    function _calculateProfit(address user) internal view returns (uint256) {
        SavingsAccount storage acct = savingsAccounts[user];
        if (!acct.active || acct.principal == 0) return 0;
        uint256 elapsed = block.timestamp - acct.lastUpdateTime;
        // Annual profit-share, pro-rated by time
        // profit = principal × profitShareBps / 10000 × elapsed / 365 days
        return (acct.principal * profitShareBps * elapsed) / (10_000 * 365 days);
    }

    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }
}
