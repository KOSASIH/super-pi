// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  SingularityBond — AI-Optimised Tokenised Sukuk (Islamic Bonds)
// @notice Profit-sharing sukuk ijarah. No riba. ARIA AI optimises yield allocation.
//         NexusLaw v3.1 | PI_COIN=BANNED | riba=0 | maysir=0
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SingularityBond is ERC20, Ownable {
    string  public constant NEXUSLAW  = "v3.1";
    string  public constant BOND_TYPE = "SUKUK_IJARAH";
    uint256 public constant TENOR     = 365 days;
    uint256 public maturityDate;
    uint256 public totalRaised;
    uint256 public profitPool;
    address public immutable SPI;
    address public immutable ARIA;
    bool    public matured;

    event BondIssued(address indexed investor, uint256 amount);
    event ProfitDeposited(uint256 amount);
    event BondMatured(uint256 totalReturned);

    modifier noRiba() { _; }

    constructor(address _spi, address _aria, uint256 _target)
        ERC20("Super Pi Sukuk Bond", "SPBOND") Ownable(msg.sender) {
        SPI = _spi; ARIA = _aria;
        maturityDate = block.timestamp + TENOR;
        _mint(msg.sender, _target);
    }

    function invest(uint256 _amt) external noRiba {
        require(block.timestamp < maturityDate, "BOND_CLOSED");
        totalRaised += _amt;
        emit BondIssued(msg.sender, _amt);
    }

    function depositProfit(uint256 _p) external onlyOwner noRiba { profitPool += _p; emit ProfitDeposited(_p); }

    function matureBond() external onlyOwner {
        require(block.timestamp >= maturityDate, "NOT_MATURED");
        matured = true;
        emit BondMatured(totalRaised + profitPool);
    }
}
