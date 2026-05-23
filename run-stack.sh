#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  echo ".env file not found in project root"
  exit 1
fi

export $(python3 - <<'PY'
from pathlib import Path
import shlex
for line in Path('.env').read_text().splitlines():
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    if '=' not in line:
        continue
    key, value = line.split('=', 1)
    print(f'{key}={shlex.quote(value)}')
PY
)

IMAGE_API="${API_IMAGE:-api:local}"
IMAGE_FRONTEND="${FRONTEND_IMAGE:-frontend:local}"

echo "Building API image: ${IMAGE_API}"
docker build -t "${IMAGE_API}" ./api

echo "Building frontend image: ${IMAGE_FRONTEND}"
docker build -t "${IMAGE_FRONTEND}" ./front-end

echo "Deploying Docker stack teste-correios"
docker stack deploy -c docker-stack.yml teste-correios

echo "Deployment initiated. Backend: http://127.0.0.1:8080/health"
echo "Frontend: http://127.0.0.1:3000"
