// SPDX-License-Identifier: MIT
// ARCHON Forge — Phase 3 Deploy Script B: CERTIFY HALAL
// Broadcaster: SHARIAH_BOARD independent multisig (NOT the VAULT_MANAGER wallet)
// RWA-05: constructor enforces _shariahBoard != msg.sender at factory deploy time.
//
// Run AFTER Script A. Requires vaultIds from Script A stdout.
// Set env vars before running:
//   export TBILL_VAULT_ID=<id from Script A>
//   export REALESTATE_VAULT_ID=<id from Script A>
//   export SUKUK_VAULT_ID=<id from Script A>
//   export RWA_FACTORY=<deployed factory address>
//
// Network RPC: https://rpc.super-pi-l2.io

pragma solidity ^0.8.24;
import "forge-std/Script.sol";

interface IRWAVaultFactory {
    function certifyHalal(uint256 vaultId) external;
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
        IRWAVaultFactory(factory).certifyHalal(tbillId);
        IRWAVaultFactory(factory).certifyHalal(realEstId);
        IRWAVaultFactory(factory).certifyHalal(sukukId);
        vm.stopBroadcast();

        console.log("=== Script B complete — all vaults halal-certified and active ===");
        console.log("SPI-TBILL-V1      certified, vaultId:", tbillId);
        console.log("SPI-REALESTATE-V1 certified, vaultId:", realEstId);
        console.log("SPI-SUKUK-V1      certified, vaultId:", sukukId);
    }
}
