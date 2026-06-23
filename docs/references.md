# References

## Express.js Documentation

Source:
https://expressjs.com/

Purpose:
REST API development, routing, and middleware.

Expected Usage:
`server/server.js`, `server/routes/`, `server/controllers/`

---

## MongoDB Atlas Documentation

Source:
https://www.mongodb.com/docs/atlas/

Purpose:
Cloud database configuration, network access, and cluster management.

Expected Usage:
`server/db.js`, `server/.env` (`MONGO_URI`)

---

## Mongoose Documentation

Source:
https://mongoosejs.com/docs/

Purpose:
Database schema modelling, validation, hooks, and indexing.

Expected Usage:
`server/models/User.js`, `server/models/Incident.js`

---

## JWT Documentation

Source:
https://jwt.io/introduction

Purpose:
Authentication and token-based session management.

Expected Usage:
`server/middleware/authMiddleware.js`, `server/controllers/authController.js`

---

## MDN Web Docs — JavaScript Modules & Fetch API

Source:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

Purpose:
Frontend ES module structure and REST API communication.

Expected Usage:
`client/js/app.js`, `client/js/api.js`, `client/js/router.js`

---

## Chart.js Documentation

Source:
https://www.chartjs.org/docs/latest/

Purpose:
Dashboard charts (incident trends, latency, CPU, memory, severity distribution).

Expected Usage:
`client/js/dashboard.js`, `client/js/chart-loader.js`, `client/vendor/chart.umd.min.js`

---

## Socket.IO Documentation

Source:
https://socket.io/docs/v4/

Purpose:
Real-time incident create/update/delete broadcasts to connected clients.

Expected Usage:
`server/config/socket.js`, `server/controllers/incidentController.js`, `client/js/app.js`

---

## bcryptjs / OWASP Password Storage

Source:
https://www.npmjs.com/package/bcryptjs

Purpose:
Secure password hashing before storage.

Expected Usage:
`server/models/User.js`

---

## Helmet & express-rate-limit

Source:
https://helmetjs.github.io/
https://express-rate-limit.mintlify.app/

Purpose:
HTTP security headers and API rate limiting.

Expected Usage:
`server/server.js`

---

## AWS EC2 Documentation

Source:
https://docs.aws.amazon.com/ec2/

Purpose:
Application deployment on cloud virtual machines.

Expected Usage:
`deploy/`, `docs/aws-deployment.md`

---

## Node.js Documentation

Source:
https://nodejs.org/docs/latest/api/

Purpose:
Backend runtime environment.

Expected Usage:
`server/`
