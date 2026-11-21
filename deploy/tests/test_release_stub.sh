#!/usr/bin/env bash
# ==============================================================================
# Offline Stub Test for deploy/release.sh (Mock gcloud, No GCP calls)
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

# Create mock gcloud binary
cat > "$TMP_DIR/gcloud" << 'EOF'
#!/usr/bin/env bash
echo "$*" >> "$MOCK_LOG"
case "$*" in
  *"artifacts docker images describe"*)
    echo "asia-southeast1-docker.pkg.dev/cpe-se-course-2026/sda0ec11f/sda0ec11f@sha256:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
    ;;
  *"run jobs execute"*)
    if [[ "${MOCK_MIGRATE_FAIL:-0}" == "1" ]]; then
      echo "Simulated migration failure" >&2
      exit 1
    fi
    ;;
  *"run services describe"*)
    echo "https://sda0ec11f-4d7hbszvwq-as.a.run.app"
    ;;
esac
EOF
chmod +x "$TMP_DIR/gcloud"

VALID_SHA="1234567890abcdef1234567890abcdef12345678"

echo "=== Test 1: Normal release executes migrate BEFORE service update ==="
MOCK_LOG="$TMP_DIR/normal.log"
GITHUB_ENV_FILE="$TMP_DIR/github_env.txt"
: > "$MOCK_LOG"
: > "$GITHUB_ENV_FILE"

PATH="$TMP_DIR:$PATH" \
MOCK_LOG="$MOCK_LOG" \
GITHUB_ENV="$GITHUB_ENV_FILE" \
PROJECT_ID="cpe-se-course-2026" \
REGION="asia-southeast1" \
IMAGE_TAG="$VALID_SHA" \
ROLLBACK="false" \
  bash "$REPO_ROOT/deploy/release.sh" >/dev/null

grep -q 'run jobs update sda0ec11f-migrate' "$MOCK_LOG"
grep -q 'run jobs execute sda0ec11f-migrate' "$MOCK_LOG"
grep -q 'run services update sda0ec11f' "$MOCK_LOG"
grep -q 'run services update-traffic sda0ec11f --to-latest' "$MOCK_LOG"
grep -q '^SERVICE_URL=https://sda0ec11f-4d7hbszvwq-as.a.run.app$' "$GITHUB_ENV_FILE"
grep -q '^DEPLOYED_IMAGE=asia-southeast1-docker.pkg.dev/cpe-se-course-2026/sda0ec11f/sda0ec11f@sha256:' "$GITHUB_ENV_FILE"
echo "PASS: Normal release flow & GITHUB_ENV verified"

echo "=== Test 2: Rollback skips migration and updates service only ==="
MOCK_LOG="$TMP_DIR/rollback.log"
: > "$MOCK_LOG"

PATH="$TMP_DIR:$PATH" \
MOCK_LOG="$MOCK_LOG" \
PROJECT_ID="cpe-se-course-2026" \
REGION="asia-southeast1" \
IMAGE_TAG="$VALID_SHA" \
ROLLBACK="true" \
  bash "$REPO_ROOT/deploy/release.sh" >/dev/null

if grep -q 'run jobs' "$MOCK_LOG"; then
  echo "FAIL: Rollback must NOT run migration job" >&2
  exit 1
fi
grep -q 'run services update sda0ec11f' "$MOCK_LOG"
echo "PASS: Rollback mode skips migration job"

echo "=== Test 3: Failed migration aborts BEFORE service update ==="
MOCK_LOG="$TMP_DIR/fail_migrate.log"
: > "$MOCK_LOG"

if PATH="$TMP_DIR:$PATH" \
  MOCK_LOG="$MOCK_LOG" \
  MOCK_MIGRATE_FAIL="1" \
  PROJECT_ID="cpe-se-course-2026" \
  REGION="asia-southeast1" \
  IMAGE_TAG="$VALID_SHA" \
  ROLLBACK="false" \
    bash "$REPO_ROOT/deploy/release.sh" >/dev/null 2>&1; then
  echo "FAIL: Expected release.sh to abort on migration failure" >&2
  exit 1
fi

if grep -q 'run services update' "$MOCK_LOG"; then
  echo "FAIL: Service must NOT be updated when migration fails" >&2
  exit 1
fi
echo "PASS: Migration failure protects live service"

echo "=== Test 4: Invalid IMAGE_TAG rejected before any GCP call ==="
MOCK_LOG="$TMP_DIR/bad_sha.log"
: > "$MOCK_LOG"

if PATH="$TMP_DIR:$PATH" \
  MOCK_LOG="$MOCK_LOG" \
  PROJECT_ID="cpe-se-course-2026" \
  REGION="asia-southeast1" \
  IMAGE_TAG="latest" \
    bash "$REPO_ROOT/deploy/release.sh" >/dev/null 2>&1; then
  echo "FAIL: Expected non-SHA IMAGE_TAG to fail" >&2
  exit 1
fi
echo "PASS: Invalid IMAGE_TAG rejected"

echo "All deploy/release.sh offline stub tests passed!"
