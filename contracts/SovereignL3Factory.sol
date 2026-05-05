// SPDX-License-Identifier: MIT
// NEXUSLAW v4.0 | SUPER PI v13.0.0 | PI_COIN=BANNED
// Sovereign L3 Appchain Factory — EVM/SVM/MoveVM/CosmWasm, 60s deploy
pragma solidity ^0.8.24;
/// @title SovereignL3Factory
/// @notice Deploy L3 appchains on Super Pi L2. Gas token: $SPI/$SUPi only.
/// @dev NEXUSLAW v4.0 Art.18: L3 chains inherit full NexusLaw compliance.
contract SovereignL3Factory {
    enum VMType { EVM, SVM, MOVEVM, COSMWASM }
    enum FinalityMode { OPTIMISTIC_7D, ZK_INSTANT, HYBRID_1H }
    struct L3ChainConfig {
        uint256 chainId; string name;
        VMType vmType; FinalityMode finality;
        address gasToken; uint256 maxTps; uint256 blockTime;
        address operator; bool halalMode; bool kycRequired;
        uint256 createdAt; bool active;
    }
    mapping(uint256 => L3ChainConfig) public chains;
    mapping(address => uint256[]) public operatorChains;
    uint256[] public allChainIds;
    uint256 public chainCount;
    address public immutable SPI_TOKEN;
    address public immutable SUPI_TOKEN;
    event L3Deployed(uint256 indexed chainId, string name, address operator, VMType vmType);
    event L3Upgraded(uint256 indexed chainId, uint256 newMaxTps);
    error PI_COIN_BRIDGE_BLOCKED();
    constructor(address spi, address supi) { SPI_TOKEN = spi; SUPI_TOKEN = supi; }
    modifier noPI(address token) {
        require(token == SPI_TOKEN || token == SUPI_TOKEN, "Only SPI/SUPi"); _;
    }
    function deployL3(uint256 chainId, string calldata name,
        VMType vmType, FinalityMode finality,
        address gasToken, uint256 maxTps, uint256 blockTimeMs,
        bool halalMode, bool kycRequired) external noPI(gasToken) returns (uint256) {
        require(chains[chainId].createdAt == 0, "ChainID taken");
        require(bytes(name).length > 0 && bytes(name).length <= 64 && maxTps >= 100 && maxTps <= 10_000_000);
        chains[chainId] = L3ChainConfig(chainId, name, vmType, finality, gasToken,
            maxTps, blockTimeMs, msg.sender, halalMode, kycRequired, block.timestamp, true);
        operatorChains[msg.sender].push(chainId); allChainIds.push(chainId); chainCount++;
        emit L3Deployed(chainId, name, msg.sender, vmType);
        return chainId;
    }
    function upgradeL3Tps(uint256 chainId, uint256 newTps) external {
        L3ChainConfig storage c = chains[chainId];
        require(c.operator == msg.sender && newTps > c.maxTps);
        c.maxTps = newTps; emit L3Upgraded(chainId, newTps);
    }
    function getOperatorChains(address op) external view returns (uint256[] memory) {
        return operatorChains[op];
    }
}
