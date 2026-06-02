#!/usr/bin/env python3
import os, json
print("[HEALTH-CHECK] Running enterprise repository health validation...")
reports_dir = "reports"
os.makedirs(reports_dir, exist_ok=True)
report = {"status": "healthy", "warnings": []}
required_dirs = ["apps", "contracts", "packages", "services", "docs", "tests", "deployments"]
for d in required_dirs:
    if not os.path.exists(d):
        report["warnings"].append(f"Missing required directory: {d}")
        report["status"] = "degraded"
with open(os.path.join(reports_dir, "health-report.json"), "w") as f:
    json.dump(report, f, indent=2)
print(f"[HEALTH-CHECK] Complete. Status: {report['status']}")
