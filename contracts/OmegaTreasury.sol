// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  OmegaTreasury v1.0 -- Autonomous AI-Managed Halal Treasury
// @notice ARIA-guided yield optimizer. Murabaha, Sukuk, T-Bill, RWA vaults.
//         Zero riba tolerance. $SPI yield only. NexusLaw v3.0.
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract OmegaTreasury is Ownable, ReentrancyGuard {
    string  public constant VERSION          = "OmegaTreasury v1.0";
    uint256 public constant MAX_ALLOC_BPS    = 3000;

    struct Strategy {
        string  name;
        address vault;
        uint256 allocBps;
        bool    halal;
        bool    active;
        uint256 deployed;
        uint256 yield;
    }

    uint256 public strategyCount;
    uint256 public totalYield;
    address public ariaAdvisor;

    mapping(uint256 => Strategy) public strategies;

    event StrategyAdded(uint256 indexed id, string name, uint256 allocBps);
    event YieldHarvested(uint256 indexed id, uint256 amount, string instrument);
    event ARIARecommendation(uint256 indexed id, string action);
    event RibaBlocked(address indexed actor);

    modifier noRiba(string memory inst) {
        bytes32 h = keccak256(bytes(inst));
        require(h != keccak256(bytes("interest")) && h != keccak256(bytes("bond_interest")),
            "OmegaTreasury: riba blocked by NexusLaw v3.0");
        _;
    }

    constructor(address _aria) Ownable(msg.sender) { ariaAdvisor = _aria; }

    function addStrategy(
        string calldata name, address vault, uint256 allocBps,
        bool halal, string calldata instrument
    ) external onlyOwner noRiba(instrument) {
        require(allocBps <= MAX_ALLOC_BPS, "OmegaTreasury: max 30%");
        require(halal, "OmegaTreasury: halal only");
        uint256 id = ++strategyCount;
        strategies[id] = Strategy(name, vault, allocBps, halal, true, 0, 0);
        emit StrategyAdded(id, name, allocBps);
    }

    function harvest(uint256 id, uint256 amount, string calldata inst)
        external onlyOwner noRiba(inst) nonReentrant {
        require(strategies[id].active, "OmegaTreasury: inactive");
        strategies[id].yield += amount;
        totalYield += amount;
        emit YieldHarvested(id, amount, inst);
    }

    function ariaAdvise(uint256 id, string calldata action) external {
        require(msg.sender == ariaAdvisor, "OmegaTreasury: not ARIA");
        emit ARIARecommendation(id, action);
    }
}
