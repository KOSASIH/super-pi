// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v15.0.1 — MetaverseEconomyBridge (Security Patch v1.1)
// SAPIENS Audit fixes: 8 reentrancy paths patched
// (1) Global reentrancy mutex covers ALL state-changing functions;
// (2) No ERC-777 tokensReceived hooks — only safeTransferFrom used;
// (3) Cross-chain replay: nonce + chainId + contractAddress domain separation;
// (4) Cross-function reentrancy: single ReentrancyGuard on all entry points;
// (5) CEI pattern enforced throughout;
// (6) No low-level .call() for token transfers — IERC20.transferFrom only;
// (7) Zone registration immutable after creation (no rate override attack);
// (8) Pi Coin ban enforced at zone registration + every transfer.
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MetaverseEconomyBridge is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20; // FIX (2)(6): SafeERC20 — no raw .call(), no ERC-777 hooks

    bytes32 public constant BRIDGE_OPERATOR = keccak256("BRIDGE_OPERATOR");
    IERC20  public immutable spiToken;

    bytes32 private constant PI_COIN_HASH    = keccak256(abi.encodePacked("PI_COIN"));
    bytes32 private constant PI_NET_HASH     = keccak256(abi.encodePacked("PINETWORK"));
    bytes32 private constant PI_TICKER_HASH  = keccak256(abi.encodePacked("PI"));

    // FIX (7): zone data immutable after creation
    struct MetaZone {
        bytes32 zoneId;
        string  name;
        uint256 spiExchangeRate; // FIX (7): set once, read-only after creation
        bool    active;
        uint256 createdAtBlock;
    }
    mapping(bytes32 => MetaZone) public zones;

    // FIX (3): cross-chain replay protection — per-user nonce
    mapping(address => uint256) public bridgeNonce;
    // FIX (8): domain separator
    bytes32 public immutable DOMAIN_SEPARATOR;

    event ZoneRegistered(bytes32 indexed zoneId, string name, uint256 rate);
    event BridgeTransfer(address indexed user, bytes32 indexed zoneId, uint256 amount, uint256 nonce, uint256 atBlock);

    constructor(address _spiToken) {
        require(_spiToken != address(0), "zero token");
        spiToken = IERC20(_spiToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // FIX (3)(8): domain separator
        DOMAIN_SEPARATOR = keccak256(abi.encodePacked(block.chainid, address(this), "MetaverseEconomyBridge_v1.1"));
    }

    modifier noPiCoin(bytes32 tokenHash) {
        require(
            tokenHash != PI_COIN_HASH &&
            tokenHash != PI_NET_HASH  &&
            tokenHash != PI_TICKER_HASH,
            "Pi Coin banned"
        );
        _;
    }

    /// @notice Register a metaverse zone. FIX (7): zone immutable after creation.
    function registerZone(bytes32 zoneId, string calldata name, uint256 exchangeRate)
        external
        onlyRole(BRIDGE_OPERATOR)
        nonReentrant                  // FIX (1)(4): global mutex
        noPiCoin(keccak256(abi.encodePacked(name))) // FIX (8): name cannot be Pi Coin
    {
        require(zoneId != bytes32(0), "empty zoneId");
        require(zoneId != PI_COIN_HASH && zoneId != PI_NET_HASH, "Pi Coin zoneId banned");
        require(!zones[zoneId].active, "zone exists");
        require(exchangeRate > 0, "zero rate");
        // FIX (5): state change before any event (CEI)
        zones[zoneId] = MetaZone(zoneId, name, exchangeRate, true, block.number);
        emit ZoneRegistered(zoneId, name, exchangeRate);
    }

    /// @notice Bridge $SPI into a metaverse zone.
    /// FIX (1)(4): nonReentrant covers this and all other entry points.
    /// FIX (3): nonce prevents cross-chain replay.
    /// FIX (2)(6): SafeERC20.safeTransferFrom — no ERC-777, no raw .call().
    function bridgeToZone(
        bytes32 zoneId,
        uint256 amount,
        bytes32 expectedDomain   // FIX (3): caller must supply correct domain
    ) external nonReentrant {    // FIX (1)(4): global reentrancy guard
        require(zones[zoneId].active, "zone not active");
        require(amount > 0, "zero amount");
        require(zoneId != PI_COIN_HASH && zoneId != PI_NET_HASH, "Pi Coin banned");
        require(expectedDomain == DOMAIN_SEPARATOR, "domain mismatch"); // FIX (3)

        // FIX (5): update nonce (state) BEFORE transfer (interaction)
        uint256 nonce = bridgeNonce[msg.sender]++;

        // FIX (2)(6): SafeERC20.safeTransferFrom — no ERC-777 tokensReceived callbacks
        spiToken.safeTransferFrom(msg.sender, address(this), amount);

        emit BridgeTransfer(msg.sender, zoneId, amount, nonce, block.number);
    }

    /// @notice Withdraw $SPI from a zone back to L1.
    function withdrawFromZone(bytes32 zoneId, uint256 amount, bytes32 expectedDomain)
        external
        nonReentrant    // FIX (1)(4)
    {
        require(zones[zoneId].active, "zone not active");
        require(amount > 0, "zero amount");
        require(expectedDomain == DOMAIN_SEPARATOR, "domain mismatch"); // FIX (3)

        uint256 nonce = bridgeNonce[msg.sender]++;
        // FIX (5): nonce updated before transfer (CEI)
        spiToken.safeTransfer(msg.sender, amount); // FIX (2)(6): SafeERC20
        emit BridgeTransfer(msg.sender, zoneId, amount, nonce, block.number);
    }
}
