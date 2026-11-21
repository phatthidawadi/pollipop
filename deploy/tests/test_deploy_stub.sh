#!/usr/bin/env bash
# ==============================================================================
# Offline Stub Test for deploy/deploy.sh (No GCP calls)
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=== Test 1: DRY_RUN=1 default mode succeeds ==="
OUT="$(cd "$REPO_ROOT" && DRY_RUN=1 bash deploy/deploy.sh)"
echo "$OUT" | grep -q '\[DRY_RUN\] docker build'
echo "$OUT" | grep -q 'sda0ec11f-migrate'
echo "$OUT" | grep -q 'sda0ec11f-pg'
echo "$OUT" | grep -q 'Pollipop Deployment Completed!'
echo "PASS: Default DRY_RUN=1 output verified"

echo "=== Test 2: DRY_RUN=1 --demo includes DEMO_USER_PASSWORD secret ==="
OUT_DEMO="$(cd "$REPO_ROOT" && DRY_RUN=1 bash deploy/deploy.sh --demo)"
echo "$OUT_DEMO" | grep -q 'DEMO_USER_PASSWORD=sda0ec11f-demo-password:latest'
echo "$OUT_DEMO" | grep -q 'SEED_DEMO_DATA=true'
echo "PASS: --demo secret & flag verified"

echo "=== Test 3: Rejects unknown CLI argument ==="
if (cd "$REPO_ROOT" && DRY_RUN=1 bash deploy/deploy.sh --invalid-flag >/dev/null 2>&1); then
  echo "FAIL: Expected unknown flag to fail" >&2
  exit 1
fi
echo "PASS: Unknown CLI argument rejected"

echo "=== Test 4: Rejects wrong GCP project ==="
if (cd "$REPO_ROOT" && PROJECT_ID="wrong-project" DRY_RUN=1 bash deploy/deploy.sh >/dev/null 2>&1); then
  echo "FAIL: Expected wrong project ID to fail" >&2
  exit 1
fi
echo "PASS: Wrong GCP project rejected"

echo "All deploy/deploy.sh offline stub tests passed!"
