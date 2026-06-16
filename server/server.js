const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const connectDB = require('./db');
const socket = require('./config/socket');
const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const costRoutes = require('./routes/costRoutes');
const observabilityRoutes = require('./routes/observabilityRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// --- Security middleware ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'ws:', 'wss:']
    }
  }
}));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '10kb' })); // small limit blunts payload-based DoS

// Rate limiting on auth routes specifically — slows brute-force login/register attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts, please try again later' }
});
app.use('/api/auth', authLimiter);

// General API rate limit
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// --- DB + Socket.IO ---
connectDB();
socket.init(server);

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/cost', costRoutes);
app.use('/api/observability', observabilityRoutes);

app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const dbOk = dbState === 1;
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'healthy' : 'degraded',
    db: dbOk ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// Serve Chart.js — local copy first, then node_modules
const chartDest = path.join(__dirname, '../client/vendor/chart.umd.min.js');
const chartFromModules = [
  path.join(__dirname, 'node_modules/chart.js/dist/chart.umd.min.js'),
  path.join(__dirname, 'node_modules/chart.js/dist/chart.umd.js')
].find((p) => fs.existsSync(p));

const chartFile = fs.existsSync(chartDest) ? chartDest : chartFromModules;

if (chartFile) {
  app.get('/vendor/chart.umd.min.js', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.sendFile(chartFile);
  });
  console.log(`📊 Chart.js served from ${chartFile}`);
} else {
  console.warn('⚠️  Chart.js not found — run: cd server && npm run vendor');
}

// Serve the static client (so you can demo from one origin without separate hosting if needed)
app.use(express.static(path.join(__dirname, '../client')));

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`📡 Server + Socket.IO running on port ${PORT}`);
});