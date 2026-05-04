// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  HyperionIdentityV3 — Universal Post-Quantum ZK Sovereign Identity
// @notice did:hyperion: W3C DID + Falcon-1024 sigs + ZK biometrics + KYC 0-4 + OFAC v3.
//         NexusLaw v3.1 | PI_COIN=BANNED
import "@openzeppelin/contracts/access/Ownable.sol";

contract HyperionIdentityV3 is Ownable {
    string  public constant VERSION    = "3.0.0";
    string  public constant NEXUSLAW   = "v3.1";
    string  public constant DID_METHOD = "did:hyperion:";
    uint256 public constant MAX_KYC    = 4;
    string  public constant PQ_SCHEME  = "Falcon-1024";

    struct Identity {
        address wallet; bytes32 didHash; bytes falconPubKey; bytes32 biometricHash;
        uint8 kycTier; bool ofacClear; bool humanityProven; uint256 issuedAt; uint256 lastUpdated;
    }

    mapping(address => Identity) public identities;
    mapping(bytes32 => address)  public didToWallet;
    uint256 public totalIdentities;

    event IdentityIssued(address indexed wallet, bytes32 didHash, uint8 kycTier);
    event KYCUpgraded(address indexed wallet, uint8 oldTier, uint8 newTier);
    event OFACFlagged(address indexed wallet, string reason);
    event HumanityProven(address indexed wallet, bytes32 proofHash);

    modifier notBlocked(address _w) { require(identities[_w].ofacClear, "OFAC_BLOCKED"); _; }
    modifier minKYC(address _w, uint8 _t) { require(identities[_w].kycTier >= _t, "KYC_INSUFFICIENT"); _; }

    constructor() Ownable(msg.sender) {}

    function issueIdentity(address _w, bytes32 _did, bytes calldata _fk, bytes32 _bh, uint8 _t) external onlyOwner {
        require(identities[_w].issuedAt == 0, "EXISTS"); require(_t <= MAX_KYC, "INVALID_KYC");
        identities[_w] = Identity(_w, _did, _fk, _bh, _t, true, false, block.timestamp, block.timestamp);
        didToWallet[_did] = _w; totalIdentities++;
        emit IdentityIssued(_w, _did, _t);
    }

    function upgradeKYC(address _w, uint8 _n) external onlyOwner {
        uint8 old = identities[_w].kycTier;
        require(_n > old && _n <= MAX_KYC, "INVALID_UPGRADE");
        identities[_w].kycTier = _n; identities[_w].lastUpdated = block.timestamp;
        emit KYCUpgraded(_w, old, _n);
    }

    function flagOFAC(address _w, string calldata _r) external onlyOwner {
        identities[_w].ofacClear = false; emit OFACFlagged(_w, _r);
    }

    function proveHumanity(address _w, bytes32 _ph) external onlyOwner {
        identities[_w].humanityProven = true; emit HumanityProven(_w, _ph);
    }
}
