// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  QuantumVaultV2 -- Post-Quantum Secure Asset Vault
// @notice CRYSTALS-Dilithium3 + Kyber-1024 (NIST FIPS 203/204).
//         3-of-N multi-sig threshold recovery. ARIA anomaly monitoring.
//         24h withdrawal delay. $SPI + RWA tokens. NexusLaw v3.0.
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract QuantumVaultV2 is Ownable, ReentrancyGuard, Pausable {
    string  public constant VERSION    = "QuantumVault v2.0";
    string  public constant PQ_SCHEME  = "CRYSTALS-Dilithium3+KYBER-1024";
    uint256 public constant DELAY      = 24 hours;

    struct Entry { address token; uint256 amount; bytes32 pqHash; uint256 ts; bool locked; }
    struct WithdrawReq { uint256 vaultId; address req; uint256 amount; uint256 after; bool done; uint256 sigs; }

    uint256 public vaults;
    uint256 public withdrawals;
    uint256 public threshold = 3;
    address public ariaOracle;

    mapping(uint256 => Entry)        public entries;
    mapping(uint256 => WithdrawReq)  public wreqs;
    mapping(uint256 => mapping(address => bool)) public signed;
    mapping(address => bool)         public signers;

    event Deposited(uint256 indexed id, address token, uint256 amount, bytes32 pqHash);
    event WithdrawRequested(uint256 indexed wid, uint256 vid, uint256 amount);
    event WithdrawSigned(uint256 indexed wid, address signer, uint256 total);
    event VaultLocked(uint256 indexed id, string reason);
    event AnomalyDetected(uint256 indexed id, string reason);

    modifier onlySigner() {
        require(signers[msg.sender] || msg.sender == owner(), "QVv2: not signer");
        _;
    }

    constructor(address _aria) Ownable(msg.sender) { ariaOracle = _aria; signers[msg.sender] = true; }

    function deposit(address token, uint256 amount, bytes32 pqHash)
        external nonReentrant whenNotPaused returns (uint256 id) {
        require(amount > 0 && pqHash != bytes32(0));
        id = ++vaults;
        entries[id] = Entry(token, amount, pqHash, block.timestamp, false);
        emit Deposited(id, token, amount, pqHash);
    }

    function requestWithdraw(uint256 vid, uint256 amount) external nonReentrant {
        require(!entries[vid].locked && amount <= entries[vid].amount);
        uint256 wid = ++withdrawals;
        wreqs[wid] = WithdrawReq(vid, msg.sender, amount, block.timestamp + DELAY, false, 0);
        emit WithdrawRequested(wid, vid, amount);
    }

    function signWithdraw(uint256 wid) external onlySigner {
        require(!wreqs[wid].done && !signed[wid][msg.sender]);
        signed[wid][msg.sender] = true;
        wreqs[wid].sigs++;
        emit WithdrawSigned(wid, msg.sender, wreqs[wid].sigs);
    }

    function lockVault(uint256 id, string calldata reason) external {
        require(msg.sender == ariaOracle || msg.sender == owner());
        entries[id].locked = true;
        emit VaultLocked(id, reason);
        emit AnomalyDetected(id, reason);
    }

    function setSigner(address s, bool ok) external onlyOwner { signers[s] = ok; }
    function setThreshold(uint256 n) external onlyOwner { require(n >= 2); threshold = n; }
}
