// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// SuperAppBase.sol — NexusLaw v2.1 Base · All 1,000 Super Apps inherit this
// $SPI Only · noForeignToken() · Pi Coin BANNED · 100 langs · 195 countries

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

abstract contract SuperAppBase is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant NEXUS_ROLE = keccak256("NEXUS_ROLE");
    bytes32 public constant OPERATOR   = keccak256("OPERATOR");

    address public constant PI_COIN    = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf00000000;
    string  public constant NEXUS_LAW  = "NexusLaw v2.1";
    string  public constant PI_STATUS  = "BANNED";
    bool    public constant RIBA       = false; // FOREVER false

    address public immutable SPI_TOKEN;
    address public immutable PROMPT_FACTORY;
    uint16  public immutable APP_ID;
    string  public appName;
    string  public appCategory;
    uint8   public supportedLanguages = 100;
    uint8   public supportedCountries = 195;

    uint256 public totalRevenueSPI;
    uint256 public totalUsers;
    uint256 public totalTransactions;

    event PaymentReceived(address indexed payer, uint256 amount, string service);
    event PaymentRefunded(address indexed payee, uint256 amount, string reason);

    error PiCoinRejected();
    error OnlySPIAccepted();
    error RibaProhibited();

    modifier onlySPI(address token) {
        if (token == PI_COIN)   revert PiCoinRejected();
        if (token != SPI_TOKEN) revert OnlySPIAccepted();
        _;
    }

    modifier noRiba() {
        require(!RIBA, "NexusLaw v2.1: riba prohibited");
        _;
    }

    constructor(
        address _spi, address _factory, uint16 _appId,
        string memory _name, string memory _category, address _admin
    ) {
        SPI_TOKEN      = _spi;
        PROMPT_FACTORY = _factory;
        APP_ID         = _appId;
        appName        = _name;
        appCategory    = _category;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(NEXUS_ROLE, _admin);
        _grantRole(OPERATOR, _admin);
    }

    function _processPayment(address token, address from, uint256 amount, string memory service)
        internal virtual onlySPI(token) nonReentrant
    {
        (bool ok,) = SPI_TOKEN.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", from, address(this), amount)
        );
        require(ok, "SuperApp: payment failed");
        totalRevenueSPI += amount;
        totalTransactions++;
        emit PaymentReceived(from, amount, service);
    }

    function _refundPayment(address to, uint256 amount, string memory reason) internal {
        (bool ok,) = SPI_TOKEN.call(abi.encodeWithSignature("transfer(address,uint256)", to, amount));
        require(ok, "SuperApp: refund failed");
        emit PaymentRefunded(to, amount, reason);
    }

    function _registerUser(address) internal { totalUsers++; }

    function appStats() external view returns (uint256 rev, uint256 users, uint256 txns) {
        return (totalRevenueSPI, totalUsers, totalTransactions);
    }

    function pause()   external onlyRole(NEXUS_ROLE) { _pause(); }
    function unpause() external onlyRole(NEXUS_ROLE) { _unpause(); }

    function appVersion() external pure virtual returns (string memory);
}
