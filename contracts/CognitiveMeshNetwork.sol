// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v14.0.0 — CognitiveMeshNetwork
// P2P AI node registry: L1-L7 cognitive hierarchy, heartbeat healing, consensus routing
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CognitiveMeshNetwork is AccessControl {
    bytes32 public constant MESH_ADMIN = keccak256("MESH_ADMIN");
    bytes32 public constant MESH_NODE  = keccak256("MESH_NODE");
    uint256 public constant MAX_NODES  = 100_000;
    uint256 public nodeCount;
    enum NodeStatus { INACTIVE, ACTIVE, HEALING, QUARANTINED }
    struct MeshNode { address addr; string endpoint; uint256 score; uint32 layer; NodeStatus status; uint256 lastBeat; }
    mapping(address => MeshNode) public nodes;
    event NodeJoined(address indexed n, uint32 layer, uint256 score);
    event NodeHealed(address indexed n);
    event ConsensusRouted(bytes32 indexed taskId, address[] selected, uint256 confidence);
    constructor() { _grantRole(DEFAULT_ADMIN_ROLE,msg.sender); _grantRole(MESH_ADMIN,msg.sender); }
    function joinMesh(string calldata ep,uint32 layer,uint256 score) external {
        require(nodeCount<MAX_NODES,"cap"); require(nodes[msg.sender].addr==address(0),"dup");
        require(layer>=1&&layer<=7,"layer"); require(score<=10000,"score");
        nodes[msg.sender]=MeshNode(msg.sender,ep,score,layer,NodeStatus.ACTIVE,block.timestamp);
        nodeCount++; _grantRole(MESH_NODE,msg.sender); emit NodeJoined(msg.sender,layer,score); }
    function heartbeat() external onlyRole(MESH_NODE) {
        nodes[msg.sender].lastBeat=block.timestamp;
        if(nodes[msg.sender].status==NodeStatus.HEALING){ nodes[msg.sender].status=NodeStatus.ACTIVE; emit NodeHealed(msg.sender); } }
    function routeConsensus(bytes32 tid,address[] calldata sel,uint256 conf) external onlyRole(MESH_ADMIN) { emit ConsensusRouted(tid,sel,conf); }
}
