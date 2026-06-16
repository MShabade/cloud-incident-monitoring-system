# AWS EC2 deploy

Launch **Ubuntu 22.04** EC2 (ports **22** + **80** open). Add EC2 IP to **MongoDB Atlas → Network Access**.

If you already have `server/.env` configured, you only need **2 commands**:

```bash
cd cloud-incident-monitoring-system
bash deploy/install.sh
```

First time on a new server (no repo yet):

```bash
git clone https://github.com/YOUR_USER/cloud-incident-monitoring-system.git
cd cloud-incident-monitoring-system
bash deploy/install.sh
```

Copy your existing `.env` to the server if needed:

```bash
scp -i your-key.pem server/.env ubuntu@EC2_IP:~/cloud-incident-monitoring-system/server/.env
```

Optional: `cd server && node seedUsers.js` · Logs: `pm2 logs cloudops`
