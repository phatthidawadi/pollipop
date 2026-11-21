#!/bin/sh
set -e

# ------------------------------------------------------------------------------
# Pollipop Container Entrypoint
# Passes control to CMD via exec so the Node process becomes PID 1
# and properly receives SIGTERM for graceful shutdown on Cloud Run.
# ------------------------------------------------------------------------------
exec "$@"
