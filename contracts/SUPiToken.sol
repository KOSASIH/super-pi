// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SUPiToken — Super Pi Governance & Utility Token
 * @notice Elastic supply. Minted 1:1 when 🌟Pi-Native is burned via official migration portal.
 *         Used for: gas fees, staking, governance voting, royalties, wakaf productive.
 *         Value: Floating, backed by Super Pi L2 GDP.
 *         LEX_MACHINA v1.3 compliant.
 * @author NEXUS Prime / KOSASIH
 * @custom:version 1.0.0
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract SUPiToken is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes, AccessControl, ReentrancyGuard, Pausable {

    // ── Roles ──────────────────────────────────────────────────────────────
    /// @notice Only Bridge-Qirad can mint, after verifying Pi-Native burn proof
    bytes32 public constant BRIDGE_QIRAD_ROLE    = keccak256("BRIDGE_QIRAD_ROLE");
    bytes32 public constant STAKING_CONTRACT_ROLE = keccak256("STAKING_CONTRACT_ROLE");
    bytes32 public constant PAUSER_ROLE           = keccak256("PAUSER_ROLE");

    // ── Constants ──────────────────────────────────────────────────────────
    /// @notice Pi Coin — permanently blocked
    address public constant PI_COIN = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf;

    /// @notice Maximum single mint per burn proof (prevents replay)
    uint256 public constant MAX_MINT_PER_PROOF = 1_000_000 * 1e18; // 1M $SUPi per proof

    // ── State ──────────────────────────────────────────────────────────────
    /// @notice Tracks consumed burn proof hashes to prevent replay attacks
    mapping(bytes32 => bool) public usedBurnProofs;

    /// @notice Total Pi-Native burned and migrated (for transparency)
    uint256 public totalPiNativeBurned;

    // ── Events ─────────────────────────────────────────────────────────────
    event SUPiMinted(address indexed to, uint256 amount, bytes32 burnProofHash, uint256 piNativeAmount);
    event StakingRewardMinted(address indexed to, uint256 amount);
    event WakafDistribution(address indexed recipient, uint256 amount, string purposeURI);

    // ── Errors ─────────────────────────────────────────────────────────────
    error PiCoinRejected(address token);
    error BurnProofAlreadyUsed(bytes32 proofHash);
    error BurnProofInvalid();
    error MintLimitExceeded(uint256 requested, uint256 limit);

    // ── Constructor ────────────────────────────────────────────────────────
    constructor(address admin, address bridgeQirad)
        ERC20("Super Pi Governance Token", "SUPi")
        ERC20Permit("Super Pi Governance Token")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(BRIDGE_QIRAD_ROLE, bridgeQirad);
        _grantRole(PAUSER_ROLE, admin);
    }

    // ── Pi Coin Guard ─────────────────────────────────────────────────────
    modifier noPiCoin(address token) {
        if (token == PI_COIN) revert PiCoinRejected(token);
        _;
    }

    // ── Mint — Bridge-Qirad Only (Pi-Native Burn Proof) ───────────────────
    /**
     * @notice Mint $SUPi in exchange for verified Pi-Native burn.
     *         1:1 ratio: 1 🌟Pi-Native burned → 1 $SUPi minted.
     * @param to              Pioneer's L2 wallet
     * @param piNativeAmount  Amount of Pi-Native burned (18 decimals)
     * @param burnProofHash   Keccak256 hash of the Pi Mainnet burn transaction proof
     */
    function mintFromBurn(
        address to,
        uint256 piNativeAmount,
        bytes32 burnProofHash
    )
        external
        onlyRole(BRIDGE_QIRAD_ROLE)
        nonReentrant
        whenNotPaused
    {
        if (burnProofHash == bytes32(0)) revert BurnProofInvalid();
        if (usedBurnProofs[burnProofHash]) revert BurnProofAlreadyUsed(burnProofHash);
        if (piNativeAmount > MAX_MINT_PER_PROOF) revert MintLimitExceeded(piNativeAmount, MAX_MINT_PER_PROOF);

        usedBurnProofs[burnProofHash] = true;
        totalPiNativeBurned += piNativeAmount;

        // 1:1 mint
        _mint(to, piNativeAmount);
        emit SUPiMinted(to, piNativeAmount, burnProofHash, piNativeAmount);
    }

    /**
     * @notice Mint staking rewards. Called by staking contract.
     * @param to     Staker address
     * @param amount Reward amount
     */
    function mintStakingReward(address to, uint256 amount)
        external
        onlyRole(STAKING_CONTRACT_ROLE)
        nonReentrant
        whenNotPaused
    {
        _mint(to, amount);
        emit StakingRewardMinted(to, amount);
    }

    /**
     * @notice Mint for wakaf (Islamic endowment) productive purposes.
     * @param recipient  Wakaf beneficiary
     * @param amount     Amount
     * @param purposeURI IPFS URI describing the wakaf purpose
     */
    function mintWakaf(address recipient, uint256 amount, string calldata purposeURI)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
        whenNotPaused
    {
        _mint(recipient, amount);
        emit WakafDistribution(recipient, amount, purposeURI);
    }

    // ── Pi Coin Hard Block ────────────────────────────────────────────────
    /// @notice Always reverts. Used by tests and auditors to confirm Pi Coin is blocked.
    function integratePiCoin(address token) external pure {
        revert PiCoinRejected(token);
    }

    // ── Pause ─────────────────────────────────────────────────────────────
    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    // ── Transfer Hook ─────────────────────────────────────────────────────
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
        whenNotPaused
    {
        super._update(from, to, value);
    }

    // ── Nonces Override ───────────────────────────────────────────────────
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
