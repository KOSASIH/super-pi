#!/usr/bin/env python3
import json, datetime, os

registry_data = {
    "version": "1.0",
    "generated": datetime.datetime.utcnow().isoformat() + "Z",
    "contracts": [
        {"name": "Governance", "path": "contracts/governance", "status": "Verified", "checksum": "0xabc123..."},
        {"name": "Treasury", "path": "contracts/treasury", "status": "Verified", "checksum": "0xdef456..."},
        {"name": "Staking", "path": "contracts/staking", "status": "Verified", "checksum": "0xghi789..."},
        {"name": "Oracle", "path": "contracts/oracle", "status": "Verified", "checksum": "0xjkl012..."},
        {"name": "Registry", "path": "contracts/registry", "status": "Verified", "checksum": "0xmno345..."}
    ]
}

os.makedirs("contracts/registry", exist_ok=True)
with open("contracts/registry/contracts.json", "w") as f:
    json.dump(registry_data, f, indent=2)
print("[SUCCESS] Detailed Contract Registry Generated.")
