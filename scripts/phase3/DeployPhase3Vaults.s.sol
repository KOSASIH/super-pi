// SPDX-License-Identifier: MIT
// ARCHON Forge — RWA Vault Deployment Scripts (ABI-CORRECTED by OMEGA DeFi)
// Super Pi Phase 3 | 2026-06-04
//
// ✅ ABI verified from: contracts/phase3/RWAVaultFactory.sol @ master
//    blob SHA: 16d15a890bf9815bfb3ccda34bcdb1f70fb32101
//
// ❌ ARCHON Forge original had WRONG interface:
//    createVault(vaultId, spiToken, shariah, capacity, assetClass, minDeposit, oracle, halalRequired)
//    IShariah(SHARIAH_BOARD).certifyHalal(address vault)
//
// ✅ CORRECT (from actual contract):
//    createVault(string name, AssetClass assetClass, uint256 targetSize, address spiBToken) returns (uint256 vaultId)
//    RWAVaultFactory(RWA_FACTORY).certifyHalal(uint256 vaultId)
//
// SHARIAH_BOARD = AccessControl role on RWAVaultFactory, NOT a separate contract.
// certifyHalal() caller must hold SHARIAH_BOARD role.
//
// Network RPC: https://rpc.super-pi-l2.io
//
// TODO before running:
//   1. SPI_TOKEN   — $SPI ERC-20 address on Super Pi L2 (NOT 0xDEAD)
//   2. RWA_FACTORY — RWAVaultFactory deployed address on Super Pi L2
//   3. Broadcaster wallet must hold VAULT_MANAGER + SHARIAH_BOARD roles
//   4. Confirm SUPI_TOKEN address for Sukuk vault (or use SPI_TOKEN if same)
//
// NOTE: No oracle/minDeposit param in on-chain factory. Enforce at keeper layer
//       or propose as Phase 3.1 upgrade.

pragma solidity ^0.8.24;
import "forge-std/Script.sol";

interface IRWAVaultFactory {
    enum AssetClass { TBILL, REAL_ESTATE, SUKUK, MURABAHA }
    function createVault(
        string calldata name,
        AssetClass assetClass,
        uint256 targetSize,
        address spiBToken
    ) external returns (uint256 vaultId);
    function certifyHalal(uint256 vaultId) external;
}

address constant SPI_TOKEN   = address(0); // TODO
address constant RWA_FACTORY = address(0); // TODO

contract DeployTBillVault is Script {
    function run() external returns (uint256 vaultId) {
        require(SPI_TOKEN != address(0), "SPI_TOKEN not set");
        require(RWA_FACTORY != address(0), "RWA_FACTORY not set");
        vm.startBroadcast();
        vaultId = IRWAVaultFactory(RWA_FACTORY).createVault(
            "SPI-TBILL-V1", IRWAVaultFactory.AssetClass.TBILL, 5_000_000e18, SPI_TOKEN
        );
        IRWAVaultFactory(RWA_FACTORY).certifyHalal(vaultId);
        vm.stopBroadcast();
        console.log("SPI-TBILL-V1 vaultId:", vaultId);
    }
}

contract DeployRealEstateVault is Script {
    function run() external returns (uint256 vaultId) {
        require(SPI_TOKEN != address(0), "SPI_TOKEN not set");
        require(RWA_FACTORY != address(0), "RWA_FACTORY not set");
        vm.startBroadcast();
        vaultId = IRWAVaultFactory(RWA_FACTORY).createVault(
            "SPI-REALESTATE-V1", IRWAVaultFactory.AssetClass.REAL_ESTATE, 10_000_000e18, SPI_TOKEN
        );
        IRWAVaultFactory(RWA_FACTORY).certifyHalal(vaultId);
        vm.stopBroadcast();
        console.log("SPI-REALESTATE-V1 vaultId:", vaultId);
    }
}

contract DeploySukukVault is Script {
    address constant SUPI_TOKEN = address(0); // TODO: $SUPi addr or = SPI_TOKEN
    function run() external returns (uint256 vaultId) {
        require(SPI_TOKEN != address(0), "SPI_TOKEN not set");
        require(RWA_FACTORY != address(0), "RWA_FACTORY not set");
        address yieldToken = SUPI_TOKEN != address(0) ? SUPI_TOKEN : SPI_TOKEN;
        vm.startBroadcast();
        vaultId = IRWAVaultFactory(RWA_FACTORY).createVault(
            "SPI-SUKUK-V1", IRWAVaultFactory.AssetClass.SUKUK, 3_000_000e18, yieldToken
        );
        IRWAVaultFactory(RWA_FACTORY).certifyHalal(vaultId);
        vm.stopBroadcast();
        console.log("SPI-SUKUK-V1 vaultId:", vaultId);
    }
}

contract DeployAllPhase3Vaults is Script {
    function run() external {
        new DeployTBillVault().run();
        new DeployRealEstateVault().run();
        new DeploySukukVault().run();
        console.log("Phase 3: all 3 RWA vaults deployed and Halal-certified.");
    }
}
