// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v15.0.0 — UniversalBaseSovereignty
// V2 UBI engine: AI-calibrated universal base income distribution with sovereign peg enforcement
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UniversalBaseSovereignty is AccessControl, ReentrancyGuard {
    bytes32 public constant AI_DISTRIBUTOR = keccak256("AI_DISTRIBUTOR");
    IERC20 public spiToken;

    struct CitizenProfile {
        address wallet;
        uint256 needScore;      // AI-computed /10000
        uint256 totalReceived;
        uint256 lastClaim;
        bool enrolled;
        string countryCode;
    }

    mapping(address => CitizenProfile) public citizens;
    uint256 public baseAllocation = 10 * 1e18; // 10 $SPI/month base
    uint256 public claimPeriod = 30 days;
    uint256 public enrolledCount;

    event CitizenEnrolled(address indexed wallet, string countryCode, uint256 needScore);
    event UBIClaimed(address indexed wallet, uint256 amount, uint256 needScore);
    event AllocationUpdated(uint256 newBase);

    constructor(address _spi) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        spiToken = IERC20(_spi);
    }

    function enrollCitizen(address wallet, string calldata country, uint256 needScore)
        external onlyRole(AI_DISTRIBUTOR) {
        require(!citizens[wallet].enrolled, "Already enrolled");
        citizens[wallet] = CitizenProfile(wallet, needScore, 0, 0, true, country);
        enrolledCount++;
        emit CitizenEnrolled(wallet, country, needScore);
    }

    function claimUBI() external nonReentrant {
        CitizenProfile storage c = citizens[msg.sender];
        require(c.enrolled, "Not enrolled");
        require(block.timestamp >= c.lastClaim + claimPeriod, "Claim period not elapsed");
        uint256 amount = baseAllocation * (5000 + c.needScore) / 10000;
        c.totalReceived += amount;
        c.lastClaim = block.timestamp;
        require(spiToken.transfer(msg.sender, amount), "Transfer failed");
        emit UBIClaimed(msg.sender, amount, c.needScore);
    }

    function updateNeedScore(address wallet, uint256 newScore) external onlyRole(AI_DISTRIBUTOR) {
        citizens[wallet].needScore = newScore;
    }
}
