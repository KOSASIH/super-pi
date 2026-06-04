// SPDX-License-Identifier: MIT
// ARCHON Forge — Phase 3 Deploy Script A: CREATE VAULTS
// Broadcaster: VAULT_MANAGER wallet
// ABI-verified against RWAVaultFactory v1.1 @ 898c2a79
//
// PURPOSE: createVault() for SPI-TBILL-V1, SPI-REALESTATE-V1, SPI-SUKUK-V1
// DOES NOT call certifyHalal() — that is Script B (SHARIAH_BOARD multisig).
//
// RWA-05: certifyHalal() is intentionally in a separate script.
//         SHARIAH_BOARD != msg.sender is enforced at factory constructor level.
//
// ── Pre-flight checklist ─────────────────────────────────────────────────────
// □ SAPIENS re-audit cleared
// □ $SPI ERC-20 deployed → fill SPI_TOKEN below
// □ ISPIRegistry deployed and $SPI registered → fill SPI_REGISTRY
// □ RWAVaultFactory v1.1 deployed → fill RWA_FACTORY
// □ Broadcaster wallet holds VAULT_MANAGER role on RWAVaultFactory
//
// ── After running this script ────────────────────────────────────────────────
// 1. Note the 3 vaultIds printed to stdout
// 2. Set env vars for Script B:
//    export TBILL_VAULT_ID=<id>
//    export REALESTATE_VAULT_ID=<id>
//    export SUKUK_VAULT_ID=<id>
//    export RWA_FACTORY=<addr>
// 3. Hand off to SHARIAH_BOARD multisig for Script B
//
// Network RPC: https://rpc.super-pi-l2.io
// ─────────────────────────────────────────────────────────────────────────────

pragma solidity ^0.8.24;
import "forge-std/Script.sol";

interface IRWAVaultFactory {
    enum AssetClass { TBILL, REAL_ESTATE, SUKUK, MURABAHA }
    function createVault(
        string calldata name,
        AssetClass assetClass,
        uint256 targetSize,
        address spiToken
    ) external returns (uint256 vaultId);
}

// ── Fill before broadcast ─────────────────────────────────────────────────
address constant SPI_TOKEN   = address(0); // TODO: $SPI ERC-20 on Super Pi L2
address constant SUPI_TOKEN  = address(0); // TODO: $SUPi for Sukuk (or = SPI_TOKEN)
address constant RWA_FACTORY = address(0); // TODO: RWAVaultFactory v1.1 deployed addr

contract CreatePhase3Vaults is Script {
    function run() external returns (uint256 tbillId, uint256 realEstateId, uint256 sukukId) {
        require(SPI_TOKEN   != address(0), "SPI_TOKEN not set");
        require(RWA_FACTORY != address(0), "RWA_FACTORY not set");

        address sukukYieldToken = SUPI_TOKEN != address(0) ? SUPI_TOKEN : SPI_TOKEN;

        vm.startBroadcast();

        tbillId = IRWAVaultFactory(RWA_FACTORY).createVault(
            "SPI-TBILL-V1",
            IRWAVaultFactory.AssetClass.TBILL,
            5_000_000e18,
            SPI_TOKEN
        );

        realEstateId = IRWAVaultFactory(RWA_FACTORY).createVault(
            "SPI-REALESTATE-V1",
            IRWAVaultFactory.AssetClass.REAL_ESTATE,
            10_000_000e18,
            SPI_TOKEN
        );

        sukukId = IRWAVaultFactory(RWA_FACTORY).createVault(
            "SPI-SUKUK-V1",
            IRWAVaultFactory.AssetClass.SUKUK,
            3_000_000e18,
            sukukYieldToken
        );

        vm.stopBroadcast();

        console.log("=== Script A complete — vaultIds for Script B ===");
        console.log("SPI-TBILL-V1      vaultId:", tbillId);
        console.log("SPI-REALESTATE-V1 vaultId:", realEstateId);
        console.log("SPI-SUKUK-V1      vaultId:", sukukId);
        console.log("");
        console.log("Set env vars then run Script B with SHARIAH_BOARD multisig:");
        console.log("  export TBILL_VAULT_ID=<tbillId>");
        console.log("  export REALESTATE_VAULT_ID=<realEstateId>");
        console.log("  export SUKUK_VAULT_ID=<sukukId>");
        console.log("  forge script scripts/phase3/DeployPhase3Vaults_B.s.sol \\");
        console.log("    --rpc-url https://rpc.super-pi-l2.io --broadcast \\");
        console.log("    --sender <SHARIAH_BOARD_MULTISIG_ADDR>");
    }
}
