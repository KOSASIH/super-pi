// SPDX-License-Identifier: MIT
// NEXUSLAW v4.0 | SUPER PI v13.0.0 | PI_COIN=BANNED | riba=0 | mudarabah
// Hyperion Staking v2 — liquid staking stSUPi + restaking (AVS/EigenLayer-style)
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
/// @title HyperionStakingV2
/// @notice Liquid staking stSUPi. Restaking into AVS modules for extra $SPI yield.
/// @dev NEXUSLAW v4.0 Art.24: Restaking yield in $SPI only. No riba.
contract HyperionStakingV2 is ERC20, ReentrancyGuard {
    IERC20 public immutable SUPI; IERC20 public immutable SPI;
    struct StakeInfo {
        uint256 supiStaked; uint256 stakedAt; uint256 rewardDebt; bool restakingEnabled;
    }
    struct AVSModule { address moduleAddr; string name; uint256 rewardRate; bool active; }
    mapping(address => StakeInfo) public stakers;
    mapping(uint256 => AVSModule) public avsModules;
    uint256 public avsCount; uint256 public totalSUPiStaked;
    uint256 public rewardPerTokenStored; uint256 public lastUpdateTime; uint256 public rewardRate;
    event Staked(address indexed user, uint256 amount, uint256 stMinted);
    event Unstaked(address indexed user, uint256 amount, uint256 stBurned);
    event Claimed(address indexed user, uint256 spiReward);
    event AVSAdded(uint256 indexed avsId, string name, uint256 rewardRate);
    error CooldownActive();
    constructor(address supi, address spi) ERC20("Staked SUPi","stSUPi") {
        SUPI=IERC20(supi); SPI=IERC20(spi);
    }
    function stake(uint256 amount) external nonReentrant {
        require(amount>0); _updateReward(msg.sender);
        SUPI.transferFrom(msg.sender,address(this),amount);
        uint256 stAmt = totalSUPiStaked==0 ? amount : (amount*totalSupply())/totalSUPiStaked;
        _mint(msg.sender,stAmt);
        stakers[msg.sender].supiStaked+=amount; stakers[msg.sender].stakedAt=block.timestamp;
        totalSUPiStaked+=amount; emit Staked(msg.sender,amount,stAmt);
    }
    function unstake(uint256 stAmt) external nonReentrant {
        require(balanceOf(msg.sender)>=stAmt);
        require(block.timestamp>=stakers[msg.sender].stakedAt+7 days,"7-day cooldown");
        _updateReward(msg.sender);
        uint256 supiOut=(stAmt*totalSUPiStaked)/totalSupply();
        _burn(msg.sender,stAmt);
        stakers[msg.sender].supiStaked-=supiOut; totalSUPiStaked-=supiOut;
        SUPI.transfer(msg.sender,supiOut); emit Unstaked(msg.sender,supiOut,stAmt);
    }
    function claimRewards() external nonReentrant {
        _updateReward(msg.sender);
        uint256 r=stakers[msg.sender].rewardDebt; require(r>0,"No rewards");
        stakers[msg.sender].rewardDebt=0; SPI.transfer(msg.sender,r); emit Claimed(msg.sender,r);
    }
    function optInAVS(uint256 avsId) external {
        require(avsModules[avsId].active); stakers[msg.sender].restakingEnabled=true;
    }
    function addAVS(string calldata name, address addr, uint256 rr) external {
        avsModules[++avsCount]=AVSModule(addr,name,rr,true); emit AVSAdded(avsCount,name,rr);
    }
    function setRewardRate(uint256 rr) external { rewardRate=rr; _updateGlobal(); }
    function _updateGlobal() internal {
        if(totalSUPiStaked>0)
            rewardPerTokenStored+=rewardRate*(block.timestamp-lastUpdateTime)*1e18/totalSUPiStaked;
        lastUpdateTime=block.timestamp;
    }
    function _updateReward(address user) internal {
        _updateGlobal(); stakers[user].rewardDebt+=stakers[user].supiStaked*rewardPerTokenStored/1e18;
    }
}
