#!/bin/sh
# Prepare a local image. Coolify deployment is a separate operation.
set -eu
cd "$(dirname "$0")"
: "${VITE_API_URL:?Set the public HTTPS API origin in VITE_API_URL}"
exec docker build --build-arg "VITE_API_URL=$VITE_API_URL" -t techhome-frontend:local .
