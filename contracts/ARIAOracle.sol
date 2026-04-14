// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  ARIAOracle v1.0 -- Autonomous Reasoning Intelligence Architecture
// @notice On-chain AI risk scoring oracle. 0-49=SAFE, 50-74=REVIEW, 75-100=BLOCKED
//         Integrates with PromptFactoryV5. NexusLaw v3.0 enforced.
import "@openzeppelin/contracts/access/Ownable.sol";

contract ARIAOracle is Ownable {
    string public constant VERSION = "ARIA v1.0";

    struct Assessment {
        uint8   score;
        bool    halal;
        bool    piBlocked;
        bool    ribaBlocked;
        bool    gamblingBlocked;
        uint256 ts;
        string  reason;
    }

    mapping(bytes32 => Assessment) public assessments;
    mapping(address => bool)       public trustedRelayers;

    event Assessed(bytes32 indexed h, uint8 score, bool halal);
    event Blocked(bytes32 indexed h, string reason);
    event RelayerSet(address indexed r, bool trusted);

    modifier onlyRelayer() {
        require(trustedRelayers[msg.sender] || msg.sender == owner(), "ARIA: unauthorized");
        _;
    }

    constructor() Ownable(msg.sender) {}

    function submit(
        bytes32 appHash, uint8 score, bool halal,
        bool piB, bool ribaB, bool gambB, string calldata reason
    ) external onlyRelayer {
        require(score <= 100, "ARIA: bad score");
        assessments[appHash] = Assessment(score, halal, piB, ribaB, gambB, block.timestamp, reason);
        emit Assessed(appHash, score, halal);
        if (piB || ribaB || gambB) emit Blocked(appHash, reason);
    }

    function isSafe(bytes32 h) external view returns (bool) {
        Assessment memory a = assessments[h];
        return a.score < 50 && a.halal && !a.piBlocked && !a.ribaBlocked && !a.gamblingBlocked;
    }
    function setRelayer(address r, bool t) external onlyOwner {
        trustedRelayers[r] = t; emit RelayerSet(r, t);
    }
}
