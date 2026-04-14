// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  SovereignIDV2 -- ZK Sovereign Digital Identity
// @notice ZK-proof identity, biometric binding, KYC/AML, Shariah compliance.
//         Integrates with PromptFactoryV5 zkGate. OFAC/UN geo-blocks.
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SovereignIDV2 is Ownable, Pausable {
    string public constant VERSION = "SovereignID v2.0";

    struct Identity {
        bytes32 zkProof;
        bytes32 bioHash;
        uint8   kycLevel;
        bool    shariah;
        bool    active;
        uint256 issuedAt;
        uint256 expiresAt;
        string  country;
    }

    mapping(address => Identity) public ids;
    mapping(bytes32 => bool)     public usedProofs;
    mapping(string  => bool)     public bannedCountries;

    event Issued(address indexed holder, uint8 kyc, string country);
    event Revoked(address indexed holder, string reason);
    event CountryBanned(string indexed c);

    modifier notBanned(string memory c) {
        require(!bannedCountries[c], "SovID: geo-blocked");
        _;
    }

    constructor() Ownable(msg.sender) {
        bannedCountries["KP"] = true;
        bannedCountries["IR"] = true;
        bannedCountries["CU"] = true;
        bannedCountries["SY"] = true;
    }

    function issue(
        address holder, bytes32 zkProof, bytes32 bioHash,
        uint8 kycLevel, bool shariah, string calldata country, uint256 validDays
    ) external onlyOwner notBanned(country) whenNotPaused {
        require(!usedProofs[zkProof], "SovID: proof reused");
        require(kycLevel <= 3);
        usedProofs[zkProof] = true;
        ids[holder] = Identity(zkProof, bioHash, kycLevel, shariah, true,
            block.timestamp, block.timestamp + validDays * 1 days, country);
        emit Issued(holder, kycLevel, country);
    }

    function isVerified(address h) external view returns (bool) {
        Identity memory id = ids[h];
        return id.active && id.expiresAt > block.timestamp && id.kycLevel >= 1;
    }

    function revoke(address h, string calldata reason) external onlyOwner {
        ids[h].active = false; emit Revoked(h, reason);
    }
    function banCountry(string calldata c) external onlyOwner {
        bannedCountries[c] = true; emit CountryBanned(c);
    }
}
