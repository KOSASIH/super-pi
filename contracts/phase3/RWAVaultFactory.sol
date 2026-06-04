// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Purpose: Phase 3 RWA Vault Factory — tokenise T-bills / real estate / sukuk in $SPI
// NexusLaw v6.1 Art.40 (halal) | Super Pi v16.0.0-phase3

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract RWAVaultFactory is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant VAULT_MANAGER = keccak256("VAULT_MANAGER");
    bytes32 public constant SHARIAH_BOARD  = keccak256("SHARIAH_BOARD");

    enum AssetClass { TBILL, REAL_ESTATE, SUKUK, MURABAHA }

    struct VaultSpec {
        uint256 vaultId;
        string  name;
        AssetClass assetClass;
        uint256 targetSize;
        uint256 minCollateral;
        address spiToken;
        bool    halalCertified;
        uint256 totalDeposited;
        uint256 yieldAccrued;
        bool    active;
    }

    uint256 public nextVaultId;
    mapping(uint256 => VaultSpec) public vaults;
    mapping(uint256 => mapping(address => uint256)) public userDeposits;

    address public constant PI_COIN = address(0xDEAD);

    event VaultCreated(uint256 indexed vaultId, string name, AssetClass assetClass);
    event Deposited(uint256 indexed vaultId, address indexed user, uint256 amount);
    event YieldDistributed(uint256 indexed vaultId, uint256 amount);
    event HalalCertified(uint256 indexed vaultId, address certifier);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SHARIAH_BOARD, msg.sender);
    }

    modifier onlyCertifiedVault(uint256 vaultId) {
        require(vaults[vaultId].halalCertified, "RWAVault: not halal-certified");
        _;
    }

    function createVault(string calldata name, AssetClass assetClass, uint256 targetSize, address spiToken)
        external onlyRole(VAULT_MANAGER) returns (uint256 vaultId)
    {
        require(spiToken != PI_COIN, "RWAVault: PI_COIN banned");
        require(targetSize > 0, "RWAVault: zero target");

        vaultId = ++nextVaultId;
        vaults[vaultId] = VaultSpec({
            vaultId: vaultId, name: name, assetClass: assetClass,
            targetSize: targetSize, minCollateral: 11_000, spiToken: spiToken,
            halalCertified: false, totalDeposited: 0, yieldAccrued: 0, active: false
        });
        emit VaultCreated(vaultId, name, assetClass);
    }

    function certifyHalal(uint256 vaultId) external onlyRole(SHARIAH_BOARD) {
        vaults[vaultId].halalCertified = true;
        vaults[vaultId].active = true;
        emit HalalCertified(vaultId, msg.sender);
    }

    function deposit(uint256 vaultId, uint256 amount) external nonReentrant onlyCertifiedVault(vaultId) {
        VaultSpec storage v = vaults[vaultId];
        require(v.active, "RWAVault: vault not active");
        require(v.totalDeposited + amount <= v.targetSize, "RWAVault: vault full");
        IERC20(v.spiToken).safeTransferFrom(msg.sender, address(this), amount);
        v.totalDeposited += amount;
        userDeposits[vaultId][msg.sender] += amount;
        emit Deposited(vaultId, msg.sender, amount);
    }

    function distributeYield(uint256 vaultId, uint256 yieldAmount) external onlyRole(VAULT_MANAGER) onlyCertifiedVault(vaultId) {
        vaults[vaultId].yieldAccrued += yieldAmount;
        emit YieldDistributed(vaultId, yieldAmount);
    }
}
