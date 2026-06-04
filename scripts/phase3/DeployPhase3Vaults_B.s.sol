// SPDX-License-Identifier: MIT
// ARCHON Forge — Phase 3 Deploy Script B v2: CERTIFY HALAL + LEX MACHINA CERT DATA
// Broadcaster: SHARIAH_BOARD independent multisig (NOT the VAULT_MANAGER wallet)
// Updated for RWAVaultFactory v1.2 — certifyHalal() now accepts full HalalCert params.
//
// LEX Machina cert data source: LM-2026-0604 / HALAL_CERT_URI_MAPPING_PHASE3
//
// Run AFTER Script A. Set env vars:
//   export TBILL_VAULT_ID=<id>
//   export REALESTATE_VAULT_ID=<id>
//   export SUKUK_VAULT_ID=<id>
//   export RWA_FACTORY=<addr>
//
// Network RPC: https://rpc.super-pi-l2.io

pragma solidity ^0.8.24;
import "forge-std/Script.sol";

interface IRWAVaultFactory {
    function certifyHalal(
        uint256 vaultId,
        string calldata certRef,
        string calldata standard,
        string calldata certURI,
        uint256 issuedAt,
        uint256 expiresAt,
        bool    dualCert
    ) external;
}

contract CertifyPhase3Vaults is Script {
    function run() external {
        address factory   = vm.envAddress("RWA_FACTORY");
        uint256 tbillId   = vm.envUint("TBILL_VAULT_ID");
        uint256 realEstId = vm.envUint("REALESTATE_VAULT_ID");
        uint256 sukukId   = vm.envUint("SUKUK_VAULT_ID");

        require(factory   != address(0), "RWA_FACTORY env not set");
        require(tbillId   != 0,          "TBILL_VAULT_ID env not set");
        require(realEstId != 0,          "REALESTATE_VAULT_ID env not set");
        require(sukukId   != 0,          "SUKUK_VAULT_ID env not set");

        vm.startBroadcast();

        // vaultId=1 — SPI-TBILL-V1 | AAOIFI No.13 Mudarabah | dualCert: false
        IRWAVaultFactory(factory).certifyHalal(
            tbillId,
            "LM-HALAL-PHASE3-001",
            "AAOIFI No.13 Mudarabah",
            "",
            1749038400,
            1780574400,
            false
        );

        // vaultId=2 — SPI-REALESTATE-V1 | AAOIFI No.9 Ijarah | dualCert: false
        IRWAVaultFactory(factory).certifyHalal(
            realEstId,
            "LM-HALAL-PHASE3-002",
            "AAOIFI No.9 Ijarah",
            "",
            1749038400,
            1780574400,
            false
        );

        // vaultId=3 — SPI-SUKUK-V1 | AAOIFI No.17+9 Sukuk Ijarah | dualCert: true
        IRWAVaultFactory(factory).certifyHalal(
            sukukId,
            "LM-HALAL-PHASE3-003",
            "AAOIFI No.17+9 Sukuk Ijarah",
            "",
            1749038400,
            1780574400,
            true
        );

        vm.stopBroadcast();

        console.log("=== Script B v2 complete — all vaults halal-certified ===");
        console.log("SPI-TBILL-V1      LM-HALAL-PHASE3-001 vaultId:", tbillId);
        console.log("SPI-REALESTATE-V1 LM-HALAL-PHASE3-002 vaultId:", realEstId);
        console.log("SPI-SUKUK-V1      LM-HALAL-PHASE3-003 vaultId:", sukukId);
        console.log("Expires: 2026-06-04 | Renewal window: 2026-05-05");
        console.log("Trigger: call triggerCertRenewal(vaultId) from any address when window opens.");
    }
}
