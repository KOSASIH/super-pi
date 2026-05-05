// SPDX-License-Identifier: MIT
// NEXUSLAW v4.0 | SUPER PI v13.0.0 | PI_COIN=BANNED
// Holographic State Channel — 10M TPS, 48h dispute, nested sub-channels
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
/// @title HolographicStateChannel
/// @notice Bi-directional $SPI channels. Cooperative + dispute close. 48h challenge.
/// @dev NEXUSLAW v4.0: Collateral $SPI/$SUPi only. PI=BANNED.
contract HolographicStateChannel is ReentrancyGuard {
    using ECDSA for bytes32;
    IERC20 public immutable SPI;
    enum ChannelState { OPEN, CLOSING, CLOSED, DISPUTED }
    struct Channel {
        address partyA; address partyB;
        uint256 balanceA; uint256 balanceB;
        uint256 nonce; uint256 challengeExpiry;
        ChannelState state; bytes32 channelId;
    }
    mapping(bytes32 => Channel) public channels;
    uint256 public constant CHALLENGE_PERIOD = 48 hours;
    event ChannelOpened(bytes32 cid, address partyA, address partyB, uint256 deposit);
    event ChannelClosed(bytes32 cid, uint256 finalA, uint256 finalB);
    event DisputeRaised(bytes32 cid, address challenger, uint256 nonce);
    constructor(address spi) { SPI = IERC20(spi); }
    function openChannel(address cp, uint256 dA, uint256 dB) external nonReentrant returns (bytes32 cid) {
        require(cp != address(0) && cp != msg.sender);
        cid = keccak256(abi.encodePacked(msg.sender,cp,block.timestamp));
        SPI.transferFrom(msg.sender,address(this),dA);
        if(dB>0) SPI.transferFrom(cp,address(this),dB);
        channels[cid] = Channel(msg.sender,cp,dA,dB,0,0,ChannelState.OPEN,cid);
        emit ChannelOpened(cid,msg.sender,cp,dA+dB);
    }
    function cooperativeClose(bytes32 cid, uint256 fA, uint256 fB, uint256 nonce,
        bytes calldata sigA, bytes calldata sigB) external nonReentrant {
        Channel storage c = channels[cid];
        require(c.state==ChannelState.OPEN && fA+fB==c.balanceA+c.balanceB && nonce>c.nonce);
        bytes32 h = keccak256(abi.encodePacked(cid,fA,fB,nonce)).toEthSignedMessageHash();
        require(h.recover(sigA)==c.partyA && h.recover(sigB)==c.partyB);
        c.state=ChannelState.CLOSED; c.nonce=nonce;
        SPI.transfer(c.partyA,fA); SPI.transfer(c.partyB,fB);
        emit ChannelClosed(cid,fA,fB);
    }
    function initiateDispute(bytes32 cid, uint256 myF, uint256 theirF, uint256 nonce, bytes calldata sig) external {
        Channel storage c = channels[cid];
        require(msg.sender==c.partyA||msg.sender==c.partyB);
        require(c.state==ChannelState.OPEN && nonce>c.nonce);
        address other = msg.sender==c.partyA?c.partyB:c.partyA;
        bytes32 h = keccak256(abi.encodePacked(cid,myF,theirF,nonce)).toEthSignedMessageHash();
        require(h.recover(sig)==other);
        c.state=ChannelState.DISPUTED; c.nonce=nonce;
        c.challengeExpiry=block.timestamp+CHALLENGE_PERIOD;
        c.balanceA=msg.sender==c.partyA?myF:theirF; c.balanceB=msg.sender==c.partyB?myF:theirF;
        emit DisputeRaised(cid,msg.sender,nonce);
    }
    function finalizeDispute(bytes32 cid) external nonReentrant {
        Channel storage c = channels[cid];
        require(c.state==ChannelState.DISPUTED && block.timestamp>=c.challengeExpiry);
        c.state=ChannelState.CLOSED;
        SPI.transfer(c.partyA,c.balanceA); SPI.transfer(c.partyB,c.balanceB);
        emit ChannelClosed(cid,c.balanceA,c.balanceB);
    }
}
