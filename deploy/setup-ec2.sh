#!/usr/bin/env bash
# Bootstrap CloudOps on a fresh Ubuntu 22.04 / Amazon Linux 2023 EC2 instance.
# Run as a user with sudo (not root directly for the whole script).
#
# Usage:
#   chmod +x deploy/setup-ec2.sh
#   ./deploy/setup-ec2.sh
#
# Before running:
#   1. Create EC2 instance (t3.small or t3.medium recommended)
#   2. Security group: 22 (your IP), 80 (0.0.0.0/0), 443 optional
#   3. Clone this repo onto the instance
#   4. Configure server/.env (copy from server/.env.example)

set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
LOG_DIR="$APP_DIR/logs"

echo "==> CloudOps EC2 setup"
echo "    App directory: $APP_DIR"

# --- OS packages ---
if command -v apt-get &>/dev/null; then
  sudo apt-get update -y
  sudo apt-get install -y curl git nginx
elif command -v dnf &>/dev/null; then
  sudo dnf update -y
  sudo dnf install -y curl git nginx
else
  echo "Unsupported OS. Use Ubuntu 22.04 or Amazon Linux 2023."
  exit 1
fi

# --- Node.js 20 LTS ---
if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  if command -v apt-get &>/dev/null; then
    sudo apt-get install -y nodejs
  else
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo dnf install -y nodejs
  fi
fi

echo "    Node: $(node -v)  npm: $(npm -v)"

# --- PM2 ---
if ! command -v pm2 &>/dev/null; then
  sudo npm install -g pm2
fi

# --- App dependencies ---
cd "$APP_DIR/server"
if [[ ! -f .env ]]; then
  echo ""
  echo "!!  Missing server/.env — copy from .env.example and fill in values:"
  echo "    cp $APP_DIR/server/.env.example $APP_DIR/server/.env"
  echo "    nano $APP_DIR/server/.env"
  echo ""
  cp .env.example .env
  echo "    Created template .env — EDIT IT before starting the app."
fi

npm ci || npm install
npm run vendor || true

mkdir -p "$LOG_DIR"

# --- Seed data (optional, first deploy only) ---
read -r -p "Seed admin/user/guest accounts? [y/N] " SEED_USERS
if [[ "$SEED_USERS" =~ ^[Yy]$ ]]; then
  node seedUsers.js
fi

read -r -p "Seed sample incidents? [y/N] " SEED_INC
if [[ "$SEED_INC" =~ ^[Yy]$ ]]; then
  node seedIncidents.js
fi

# --- PM2 start ---
cd "$APP_DIR"
pm2 delete cloudops-api 2>/dev/null || true
pm2 start deploy/ecosystem.config.cjs --env production
pm2 save
pm2 startup | tail -1 | sudo bash || true

# --- Nginx ---
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "YOUR_EC2_PUBLIC_IP")
NGINX_CONF="/etc/nginx/conf.d/cloudops.conf"

if [[ -f "$APP_DIR/deploy/nginx-cloudops.conf" ]]; then
  sudo cp "$APP_DIR/deploy/nginx-cloudops.conf" "$NGINX_CONF"
  sudo sed -i "s/YOUR_DOMAIN_OR_IP/$PUBLIC_IP/g" "$NGINX_CONF"
  sudo nginx -t
  sudo systemctl enable nginx
  sudo systemctl restart nginx
fi

echo ""
echo "==> Setup complete"
echo "    App URL:  http://$PUBLIC_IP"
echo "    Health:   http://$PUBLIC_IP/api/health"
echo "    PM2:      pm2 status"
echo "    Logs:     pm2 logs cloudops-api"
echo ""
echo "Next steps:"
echo "  1. Edit server/.env — set MONGO_URI, JWT_SECRET, CLIENT_ORIGIN=http://$PUBLIC_IP"
echo "  2. MongoDB Atlas → Network Access → add IP: $PUBLIC_IP"
echo "  3. pm2 restart cloudops-api"
echo "  4. Optional: attach Elastic IP + HTTPS (see docs/aws-deployment.md)"
