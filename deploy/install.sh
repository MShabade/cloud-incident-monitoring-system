#!/usr/bin/env bash
# Ubuntu EC2 — requires server/.env (you already have this — just run the script)
set -e

cd "$(dirname "$0")/.."

[[ -f server/.env ]] || { echo "Need server/.env with MONGO_URI, JWT_SECRET, CLIENT_ORIGIN"; exit 1; }

# Node 20 + nginx (skip if already installed)
command -v node >/dev/null || {
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs nginx
}

# App
cd server && npm install --omit=dev && node scripts/copy-vendor.js 2>/dev/null || true
cd ..

# Run with PM2
sudo npm install -g pm2 2>/dev/null || true
pm2 delete cloudops 2>/dev/null || true
pm2 start deploy/ecosystem.config.cjs && pm2 save

# Nginx → port 80
sudo cp deploy/nginx.conf /etc/nginx/sites-available/cloudops
sudo ln -sf /etc/nginx/sites-available/cloudops /etc/nginx/sites-enabled/cloudops
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

IP=$(curl -sf http://169.254.169.254/latest/meta-data/public-ipv4 || echo "YOUR_EC2_IP")
echo "Done → http://$IP"
