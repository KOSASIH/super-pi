// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  CarbonCreditRegistry v1.0 -- Green DeFi RWA Carbon Credits
// @notice Tokenizes VCS/GS/ACR/CAR carbon credits on Super Pi L2.
//         ARIA-verified projects. $SPI denomination. OmegaTreasury halal yield.
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CarbonCreditRegistry is Ownable, ReentrancyGuard {
    string public constant VERSION = "CarbonRegistry v1.0";

    struct Project {
        uint256 id; string name; string country; string method;
        uint256 issued; uint256 retired; uint256 priceSPI;
        address verifier; bool ariaOk; bool active; uint256 vintage;
    }

    uint256 public projects;
    uint256 public totalIssued;
    uint256 public totalRetired;

    mapping(uint256 => Project)                   public proj;
    mapping(address => mapping(uint256 => uint256)) public hold;
    mapping(address => bool)                       public verifiers;

    event ProjectReg(uint256 indexed id, string name, uint256 credits);
    event ARIAApproved(uint256 indexed id, bool ok);
    event Retired(address indexed h, uint256 indexed id, uint256 credits, string reason);

    modifier onlyVerifier() { require(verifiers[msg.sender] || msg.sender == owner()); _; }

    constructor() Ownable(msg.sender) { verifiers[msg.sender] = true; }

    function register(
        string calldata name, string calldata country, string calldata method,
        uint256 credits, uint256 priceSPI, uint256 vintage
    ) external onlyVerifier returns (uint256 id) {
        bytes32 m = keccak256(bytes(method));
        require(m == keccak256(bytes("VCS")) || m == keccak256(bytes("GS")) ||
                m == keccak256(bytes("ACR")) || m == keccak256(bytes("CAR")), "Carbon: bad method");
        id = ++projects;
        proj[id] = Project(id, name, country, method, credits, 0, priceSPI,
                           msg.sender, false, false, vintage);
        totalIssued += credits;
        emit ProjectReg(id, name, credits);
    }

    function ariaApprove(uint256 id, bool ok) external onlyOwner {
        proj[id].ariaOk = ok; proj[id].active = ok; emit ARIAApproved(id, ok);
    }

    function retire(uint256 id, uint256 credits, string calldata reason) external nonReentrant {
        require(proj[id].active && hold[msg.sender][id] >= credits);
        hold[msg.sender][id] -= credits;
        proj[id].retired += credits; totalRetired += credits;
        emit Retired(msg.sender, id, credits, reason);
    }

    function addVerifier(address v) external onlyOwner { verifiers[v] = true; }
}
