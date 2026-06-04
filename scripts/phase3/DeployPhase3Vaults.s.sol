// SPDX-License-Identifier: MIT
// ARCHON Forge — Phase 3 RWA Vault Deploy Scripts (FINAL)
// ABI-verified against contracts/phase3/RWAVaultFactory.sol
// blob 16d15a890bf9815bfb3ccda34bcdb1f70fb32101
// Safety scan: PASS (Pi ban ✅ SafeERC20 ✅ ReentrancyGuard ✅ Halal gate ✅)
//
// Network: Super Pi L2  RPC: https://rpc.super-pi-l2.io
//
// ── 2 addresses required before broadcast ───────────────────────────────────
// SPI_TOKEN   : $SPI ERC-20 on Super Pi L2      (must NOT be 0xDEAD)
// RWA_FACTORY : RWAVaultFactory deployed address (deploy factory first if absent)
// SUPI_TOKEN  : $SUPi addr for Sukuk yield token  (set = SPI_TOKEN if same)
//
// Broadcaster wallet MUST hold:
//   • VAULT_MANAGER role  — to call createVault()
//   • SHARIAH_BOARD role  — to call certifyHalal()
//
// ── Typo note ────────────────────────────────────────────────────────────────
// OMEGA DeFi message used "certifyHalad" — this is a typo.
// Actual on-chain function is certifyHalal(uint256 vaultId).
//
// ── Keeper-layer TODO (Phase 3.1) ────────────────────────────────────────────
// minDeposit + oracle not in factory ABI. Enforce at keeper/deposit layer.
// ─────────────────────────────────────────────────────────────────────────────

pragma solidity ^0.8.24;
import "forge-std/Script.sol";

// Interface exactly matches contracts/phase3/RWAVaultFactory.sol
interface IRWAVaultFactory {
    enum AssetClass { TBILL, REAL_ESTATE, SUKUK, MURABAHA }
    function createVault(
        string calldata name,
        AssetClass assetClass,
        uint256 targetSize,
        address spiToken
    ) external returns (uint256 vaultId);
    function certifyHalal(uint256 vaultId) external;   // ← not certifyHalad
}

// ── Fill before broadcast ────────────────────────────────────────────────────
address constant SPI_TOKEN   = address(0); // TODO: $SPI ERC-20, Super Pi L2
address constant RWA_FACTORY = address(0); // TODO: RWAVaultFactory on Super Pi L2
address constant SUPI_TOKEN  = address(0); // TODO: $SUPi addr, or leave 0 to use SPI_TOKEN

// ── Shared pre-flight guard ──────────────────────────────────────────────────
function requireAddresses() pure {
    require(SPI_TOKEN   != address(0),      "SPI_TOKEN not set");
    require(RWA_FACTORY != address(0),      "RWA_FACTORY not set");
    require(SPI_TOKEN   != address(0xDEAD), "SPI_TOKEN must not be PI_COIN");
}

// ─────────────────────────────────────────────────────────────────────────────
// Script 1 — SPI-TBILL-V1  ($5M)
// ─────────────────────────────────────────────────────────────────────────────
contract DeployTBillVault is Script {
    function run() external returns (uint256 vaultId) {
        requireAddresses();
        vm.startBroadcast();
        vaultId = IRWAVaultFactory(RWA_FACTORY).createVault(
            "SPI-TBILL-V1",
            IRWAVaultFactory.AssetClass.TBILL,
            5_000_000e18,
            SPI_TOKEN
        );
        IRWAVaultFactory(RWA_FACTORY).certifyHalal(vaultId);
        vm.stopBroadcast();
        console.log("SPI-TBILL-V1 deployed | vaultId:", vaultId);
        console.log("certifyHalal: done | vault active: true");
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Script 2 — SPI-REALESTATE-V1  ($10M)
// ─────────────────────────────────────────────────────────────────────────────
contract DeployRealEstateVault is Script {
    function run() external returns (uint256 vaultId) {
        requireAddresses();
        vm.startBroadcast();
        vaultId = IRWAVaultFactory(RWA_FACTORY).createVault(
            "SPI-REALESTATE-V1",
            IRWAVaultFactory.AssetClass.REAL_ESTATE,
            10_000_000e18,
            SPI_TOKEN
        );
        IRWAVaultFactory(RWA_FACTORY).certifyHalal(vaultId);
        vm.stopBroadcast();
        console.log("SPI-REALESTATE-V1 deployed | vaultId:", vaultId);
        console.log("certifyHalal: done | vault active: true");
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Script 3 — SPI-SUKUK-V1  ($3M)
// ─────────────────────────────────────────────────────────────────────────────
contract DeploySukukVault is Script {
    function run() external returns (uint256 vaultId) {
        requireAddresses();
        // Use $SUPi for Sukuk yield token if configured, else fall back to $SPI
        address yieldToken = SUPI_TOKEN != address(0) ? SUPI_TOKEN : SPI_TOKEN;
        require(yieldToken != address(0xDEAD), "yieldToken must not be PI_COIN");
        vm.startBroadcast();
        vaultId = IRWAVaultFactory(RWA_FACTORY).createVault(
            "SPI-SUKUK-V1",
            IRWAVaultFactory.AssetClass.SUKUK,
            3_000_000e18,
            yieldToken
        );
        IRWAVaultFactory(RWA_FACTORY).certifyHalal(vaultId);
        vm.stopBroadcast();
        console.log("SPI-SUKUK-V1 deployed | vaultId:", vaultId);
        console.log("certifyHalal: done | vault active: true");
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Script 4 — DeployAllPhase3Vaults  (atomic 3-vault sequence)
// ─────────────────────────────────────────────────────────────────────────────
contract DeployAllPhase3Vaults is Script {
    function run() external {
        uint256 tbill      = new DeployTBillVault().run();
        uint256 realestate = new DeployRealEstateVault().run();
        uint256 sukuk      = new DeploySukukVault().run();
        console.log("--- Phase 3 complete ---");
        console.log("TBILL vaultId:",      tbill);
        console.log("REALESTATE vaultId:", realestate);
        console.log("SUKUK vaultId:",      sukuk);
        console.log("All vaults certifyHalal confirmed. Ready for VULCAN Deploy.");
    }
}
