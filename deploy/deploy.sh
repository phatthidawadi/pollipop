#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Pollipop — Idempotent Google Cloud Run Deployment Script (Team sda0ec11f)
# ==============================================================================
# Usage:
#   ./deploy/deploy.sh [--demo]
#
# Environment Variables (Optional):
#   PROJECT_ID   GCP Project ID (fixed to cpe-se-course-2026)
#   REGION       GCP Region (fixed to asia-southeast1)
#   DRY_RUN      Set DRY_RUN=1 to print all gcloud/docker commands without executing
#
# WHAT THIS SCRIPT DOES (Course Portal pre-provisions steps 1–8)
#   9 build & push unified image   10 update & execute migrate+seed job
#   11 update Cloud Run service    12 route 100% traffic & print summary
#   Routine releases are handled by GitHub Actions (deploy.yml -> deploy/release.sh).
#
# IMPORTANT
#   - Preview first with: DRY_RUN=1 bash deploy/deploy.sh (no gcloud calls)
#   - Run from the REPO ROOT (step 9 builds the root Dockerfile).
#   - Live deploy (DRY_RUN=0) is restricted to reviewed `main` branch only.
#   - Offline test: deploy/tests/test_deploy_stub.sh
# ==============================================================================

DRY_RUN="${DRY_RUN:-1}"
REGION="${REGION:-asia-southeast1}"
SEED_DEMO_DATA="false"

for arg in "$@"; do
  case "$arg" in
    --demo)
      SEED_DEMO_DATA="true"
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      echo "Usage: $0 [--demo]" >&2
      exit 1
      ;;
  esac
done

# Helper: prints the command (DRY_RUN=1) or prints then executes it.
# IMPORTANT: --password=... is redacted in the log; keep this behaviour.
run_cmd() {
  local arg
  if [ "$DRY_RUN" = "1" ]; then
    printf '[DRY_RUN] '
  else
    printf '+ '
  fi
  for arg in "$@"; do
    case "$arg" in
      --password=*) printf '%s ' '--password=<REDACTED>' ;;
      *) printf '%q ' "$arg" ;;
    esac
  done
  printf '\n'
  if [ "$DRY_RUN" != "1" ]; then
    "$@"
  fi
}

# Shared course project: no project discovery or project IAM changes.
PROJECT_ID="${PROJECT_ID:-cpe-se-course-2026}"
[[ "$PROJECT_ID" == "cpe-se-course-2026" ]] || { echo 'Wrong course project' >&2; exit 1; }
REGION="${REGION:-asia-southeast1}"
[[ "$REGION" == "asia-southeast1" ]] || { echo 'Wrong assigned region' >&2; exit 1; }
REPO_NAME="sda0ec11f"
SQL_INSTANCE="sda0ec11f-pg"
DB_NAME="sda0ec11f"
DB_USER="sda0ec11f"
SERVICE_NAME="sda0ec11f"
MIGRATE_JOB_NAME="sda0ec11f-migrate"
SA_NAME="sda0ec11f-runner"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
SQL_CONN_NAME="${PROJECT_ID}:${REGION}:${SQL_INSTANCE}"
if [ "$DRY_RUN" = "1" ]; then
  IMAGE_TAG="${IMAGE_TAG:-0000000000000000000000000000000000000000}"
else
  IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse HEAD)}"
  [[ "$(git branch --show-current)" == "main" ]] || { echo 'Deploy reviewed main only' >&2; exit 1; }
  [[ "$IMAGE_TAG" == "$(git rev-parse HEAD)" ]] || { echo 'IMAGE_TAG must match HEAD' >&2; exit 1; }
fi
[[ "$IMAGE_TAG" =~ ^[0-9a-f]{40}$ ]] || { echo 'Use full commit SHA' >&2; exit 1; }
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:${IMAGE_TAG}"

# Secret Manager secret names (values are never stored in this repo).
SECRET_DB_URL="sda0ec11f-database-url"
SECRET_ADMIN_PASS="sda0ec11f-admin-password"
SECRET_DEMO_PASS="sda0ec11f-demo-password"

echo "=================================================================="
echo "Pollipop Cloud Run Deployment"
echo "Project : ${PROJECT_ID}"
echo "Region  : ${REGION}"
echo "Demo    : ${SEED_DEMO_DATA}"
echo "Dry Run : ${DRY_RUN}"
echo "=================================================================="

# ==============================================================================
# Portal/TA pre-provisions infrastructure and public service IAM (steps 1–8).
# These names must exist. Never create or modify project-level IAM here.
# ==============================================================================
JOB_SECRETS="DATABASE_URL=${SECRET_DB_URL}:latest,ADMIN_PASSWORD=${SECRET_ADMIN_PASS}:latest"
if [ "$SEED_DEMO_DATA" = "true" ]; then
  JOB_SECRETS="${JOB_SECRETS},DEMO_USER_PASSWORD=${SECRET_DEMO_PASS}:latest"
fi
if [ "$DRY_RUN" != "1" ]; then
  gcloud run services describe "$SERVICE_NAME" --project "$PROJECT_ID" --region "$REGION" >/dev/null
  gcloud run jobs describe "$MIGRATE_JOB_NAME" --project "$PROJECT_ID" --region "$REGION" >/dev/null
fi

# ==============================================================================
# 9. Build & Push Unified Container Image
# ==============================================================================
run_cmd gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet
run_cmd docker build --platform linux/amd64 --tag "$IMAGE_URI" .
run_cmd docker push "$IMAGE_URI"
if [ "$DRY_RUN" != "1" ]; then
  IMAGE_URI="$(gcloud artifacts docker images describe "$IMAGE_URI" --project "$PROJECT_ID" --format='value(image_summary.fully_qualified_digest)')"
  [[ "$IMAGE_URI" == "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}@sha256:"* ]] || { echo 'Missing image digest' >&2; exit 1; }
fi

# ==============================================================================
# 10. Update & Execute Cloud Run Job for Migration + Idempotent Seed
#     IMPORTANT: if this job fails the script stops BEFORE deploying the service.
# ==============================================================================
run_cmd gcloud run jobs update "$MIGRATE_JOB_NAME" \
  --image "$IMAGE_URI" \
  --region "$REGION" \
  --service-account "$SA_EMAIL" \
  --set-cloudsql-instances "$SQL_CONN_NAME" \
  --set-secrets "$JOB_SECRETS" \
  --set-env-vars "NODE_ENV=production,TZ=Asia/Bangkok,SEED_DEMO_DATA=${SEED_DEMO_DATA}" \
  --command "sh" \
  --args "-c,npx prisma migrate deploy && npm run prisma:seed" \
  --max-retries 1 \
  --task-timeout 300s \
  --project "$PROJECT_ID"

if ! run_cmd gcloud run jobs execute "$MIGRATE_JOB_NAME" \
  --region "$REGION" \
  --wait \
  --project "$PROJECT_ID"; then
  printf '%s\n' "ERROR: Cloud Run migration job '${MIGRATE_JOB_NAME}' failed. Aborting service deployment." >&2
  printf '%s\n' "View job logs with:" >&2
  printf '%s\n' "  gcloud logging read \"resource.type=cloud_run_job AND resource.labels.job_name=${MIGRATE_JOB_NAME}\" --project \"${PROJECT_ID}\" --limit 50 --format=\"value(textPayload)\"" >&2
  exit 1
fi

# ==============================================================================
# 11. Deploy Cloud Run Service (Port 3000 matches root Dockerfile)
# ==============================================================================
run_cmd gcloud run services update "$SERVICE_NAME" \
  --image "$IMAGE_URI" \
  --region "$REGION" \
  --service-account "$SA_EMAIL" \
  --add-cloudsql-instances "$SQL_CONN_NAME" \
  --set-secrets "DATABASE_URL=${SECRET_DB_URL}:latest" \
  --set-env-vars "NODE_ENV=production,TZ=Asia/Bangkok" \
  --min-instances 0 \
  --max-instances 1 \
  --memory 512Mi \
  --cpu 1 \
  --port 3000 \
  --project "$PROJECT_ID"

run_cmd gcloud run services update-traffic "$SERVICE_NAME" --to-latest --project "$PROJECT_ID" --region "$REGION" --quiet
if [ "$DRY_RUN" = "1" ]; then
  SERVICE_URL="https://${SERVICE_NAME}-<hash>-as.a.run.app"
else
  SERVICE_URL="$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --project "$PROJECT_ID" --format='value(status.url)')"
fi

# ------------------------------------------------------------------------------
# Summary output (URLs; passwords stay in Secret Manager and are not printed)
# ------------------------------------------------------------------------------
printf '\n'
printf '%s\n' "=================================================================="
printf '%s\n' "Pollipop Deployment Completed!"
printf '%s\n' "Service URL    : ${SERVICE_URL}"
printf '%s\n' "Health Check   : ${SERVICE_URL}/api/health"
printf '%s\n' "Readiness Check: ${SERVICE_URL}/api/ready"
printf '%s\n' "Owner Account  : owner1@pollipop.local"
printf '%s\n' "Admin Password : Stored in Secret Manager: ${SECRET_ADMIN_PASS} (not printed)."
if [ "$SEED_DEMO_DATA" = "true" ]; then
  printf '%s\n' "Demo Password  : Stored in Secret Manager: ${SECRET_DEMO_PASS} (not printed)."
fi
printf '%s\n' "=================================================================="
