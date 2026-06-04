// SPDX-License-Identifier: MIT
// ARCHON Forge -- Phase 3 Deploy Script B FINAL: CERTIFY HALAL + LEX MACHINA CERT DATA
// Broadcaster: SHARIAH_BOARD independent multisig (NOT the VAULT_MANAGER wallet)
// RWAVaultFactory v1.3 -- certifyHalal() 7-param signature
//
// LEX Machina cert docs (pinned to df5c9a87, supersedes 9cecea3c/7e584800/47aea919):
//   LM-HALAL-PHASE3-001: https://raw.githubusercontent.com/KOSASIH/super-pi/df5c9a878f004bc678f8059244357dd7812dd0b9/docs/halal-certs/LM-HALAL-PHASE3-001-SPI-TBILL-V1.md
//   LM-HALAL-PHASE3-002: https://raw.githubusercontent.com/KOSASIH/super-pi/df5c9a878f004bc678f8059244357dd7812dd0b9/docs/halal-certs/LM-HALAL-PHASE3-002-SPI-REALESTATE-V1.md
//   LM-HALAL-PHASE3-003: https://raw.githubusercontent.com/KOSASIH/super-pi/df5c9a878f004bc678f8059244357dd7812dd0b9/docs/halal-certs/LM-HALAL-PHASE3-003-SPI-SUKUK-V1.md
// Cert doc SHA: c1ca2433 | NexusLaw v6.1 Art.40
//
// AAOIFI standard strings locked by VULCAN after cert URI verification:
//   SPI-TBILL-V1:      'AAOIFI No.13'
//   SPI-REALESTATE-V1: 'AAOIFI No.9'
//   SPI-SUKUK-V1:      'AAOIFI No.17 + No.9'
//
// Epochs: issuedAt 1780531200 (2026-06-04T00:00Z) | expiresAt 1812067200 (2027-06-04T00:00Z)
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

        // vaultId=1 -- SPI-TBILL-V1 | AAOIFI No.13 Mudarabah | dualCert: false
        IRWAVaultFactory(factory).certifyHalal(
            tbillId,
            "LM-HALAL-PHASE3-001",
            "AAOIFI No.13",
            "https://raw.githubusercontent.com/KOSASIH/super-pi/df5c9a878f004bc678f8059244357dd7812dd0b9/docs/halal-certs/LM-HALAL-PHASE3-001-SPI-TBILL-V1.md",
            1780531200,
            1812067200,
            false
        );

        // vaultId=2 -- SPI-REALESTATE-V1 | AAOIFI No.9 Ijarah | dualCert: false
        IRWAVaultFactory(factory).certifyHalal(
            realEstId,
            "LM-HALAL-PHASE3-002",
            "AAOIFI No.9",
            "https://raw.githubusercontent.com/KOSASIH/super-pi/df5c9a878f004bc678f8059244357dd7812dd0b9/docs/halal-certs/LM-HALAL-PHASE3-002-SPI-REALESTATE-V1.md",
            1780531200,
            1812067200,
            false
        );

        // vaultId=3 -- SPI-SUKUK-V1 | AAOIFI No.17 + No.9 Sukuk Ijarah | dualCert: TRUE
        IRWAVaultFactory(factory).certifyHalal(
            sukukId,
            "LM-HALAL-PHASE3-003",
            "AAOIFI No.17 + No.9",
            "https://raw.githubusercontent.com/KOSASIH/super-pi/df5c9a878f004bc678f8059244357dd7812dd0b9/docs/halal-certs/LM-HALAL-PHASE3-003-SPI-SUKUK-V1.md",
            1780531200,
            1812067200,
            true
        );

        vm.stopBroadcast();

        console.log("=== Script B FINAL -- all vaults halal-certified ===");
        console.log("SPI-TBILL-V1      LM-HALAL-PHASE3-001  AAOIFI No.13          vaultId:", tbillId);
        console.log("SPI-REALESTATE-V1 LM-HALAL-PHASE3-002  AAOIFI No.9           vaultId:", realEstId);
        console.log("SPI-SUKUK-V1      LM-HALAL-PHASE3-003  AAOIFI No.17 + No.9   vaultId:", sukukId);
        console.log("issuedAt: 1780531200 | expiresAt: 1812067200");
        console.log("Renewal window opens: 2027-06-04");
        console.log("Trigger: call triggerCertRenewal(vaultId) from any address when window opens.");
    }
}
