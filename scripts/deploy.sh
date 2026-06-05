#!/bin/bash
ENV=$1
echo "[DEPLOY] Triggering deployment validations for: $ENV"
echo "[DEPLOY] Synthesizing contracts..."
python3 scripts/contract-registry.py
echo "[DEPLOY] Deployment phase verified."
