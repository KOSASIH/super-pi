#!/usr/bin/env python3
import os, json, hashlib
print("[REGISTRY] Generating contract registry...")
registry = {"version": "1.0", "contracts": []}
contracts_dir = "contracts"
for root, dirs, files in os.walk(contracts_dir):
    for f in files:
        if f.endswith((".ts", ".sol", ".rs")):
            path = os.path.join(root, f)
            with open(path, "rb") as file_content:
                checksum = hashlib.sha256(file_content.read()).hexdigest()
                registry["contracts"].append({"name": f, "path": path, "checksum": checksum})
os.makedirs("contracts/registry", exist_ok=True)
with open("contracts/registry/contracts.json", "w") as f:
    json.dump(registry, f, indent=2)
print("[REGISTRY] Registry successfully generated.")
