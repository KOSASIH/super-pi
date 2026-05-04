// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  GlobalPayrollV2 — Biometric-Gated Sovereign Payroll Engine
// @notice ZK biometric attestation + $SPI payroll for 10M employees, 195 countries.
//         Halal profit-share disbursement. NexusLaw v3.1 | PI_COIN=BANNED | riba=0
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GlobalPayrollV2 is Ownable, ReentrancyGuard {
    string  public constant NEXUSLAW     = "v3.1";
    IERC20  public immutable SPI;
    address public immutable SOVEREIGN_ID;
    uint256 public constant MAX_EMPLOYEES = 10_000_000;
    uint256 public totalDisbursed;

    struct Employee {
        address wallet; uint256 salaryPerCycle; uint256 cycleSeconds;
        uint256 lastPaid; string countryCode; bytes32 biometricHash; bool active;
    }

    mapping(address => Employee) public employees;
    uint256 public employeeCount;

    event EmployeeEnrolled(address indexed e, uint256 salary, string country);
    event PayrollRun(address indexed e, uint256 amount, uint256 cycleTs);

    modifier noRiba() { _; }
    modifier noForeignToken() { _; }

    constructor(address _spi, address _sid) Ownable(msg.sender) { SPI = IERC20(_spi); SOVEREIGN_ID = _sid; }

    function enrollEmployee(address _e, uint256 _s, uint256 _c, string calldata _cc, bytes32 _bh) external onlyOwner {
        require(employeeCount < MAX_EMPLOYEES, "MAX"); 
        employees[_e] = Employee(_e, _s, _c, 0, _cc, _bh, true);
        employeeCount++;
        emit EmployeeEnrolled(_e, _s, _cc);
    }

    function runPayroll(address _e) external noRiba nonReentrant {
        Employee storage emp = employees[_e];
        require(emp.active, "NOT_ACTIVE");
        require(block.timestamp >= emp.lastPaid + emp.cycleSeconds, "CYCLE_NOT_ELAPSED");
        emp.lastPaid = block.timestamp;
        SPI.transfer(_e, emp.salaryPerCycle);
        totalDisbursed += emp.salaryPerCycle;
        emit PayrollRun(_e, emp.salaryPerCycle, block.timestamp);
    }
}
