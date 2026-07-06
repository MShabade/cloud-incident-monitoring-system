# B9IS109 Demo — Report Section → Code Map

Use this when your professor asks *"Where is this in your code?"* Open the file in Cursor/VS Code and jump to the line shown.

---

## Quick demo order (5 minutes)

1. **Login** → `client/js/auth.js` + `server/controllers/authController.js`
2. **Dashboard** → `client/js/dashboard.js` + `server/controllers/incidentController.js` (`getMetrics`)
3. **Create incident** → `client/js/incidents.js` + `incidentController.js` (`createIncident`)
4. **Search / filter** → `incidentController.js` (`getAllIncidents`)
5. **RBAC** → `server/middleware/authMiddleware.js` + `incidentRoutes.js`
6. **Real-time update** → `server/config/socket.js` + `client/js/app.js`
7. **Webhook** → `server/middleware/webhookAuth.js` + `ingestCloudAlert`

---

## 1. Introduction / Architecture (Report §4)

| What professor asks | Open this file | What to show |
|---------------------|----------------|--------------|
| Where does the server start? | `server/server.js` | Routes, Helmet, rate limit, static client, Socket.IO init |
| How is the API structured? | `server/routes/incidentRoutes.js` | REST routes with `protect` / `restrictTo` |
| Client-server split? | `client/js/api.js` | Fetch API calls to `/api/...` |
| Real-time updates? | `server/config/socket.js` | Socket.IO server setup |
| | `client/js/app.js` | Client listens for `incident:created` etc. |

---

## 2. Data Model (Report §5)

| What professor asks | Open this file | What to show |
|---------------------|----------------|--------------|
| Incident schema / MongoDB document | `server/models/Incident.js` | Fields, enums, `timeline[]`, `comments[]`, SLA hook |
| User schema + password hashing | `server/models/User.js` | bcrypt pre-save hook |
| Shared enums (severity, status, teams) | `server/shared-taxonomy.js` | Same values on client and server |
| DB connection | `server/db.js` | MongoDB Atlas connection |

---

## 3. CRUD Operations (Report §6)

| Operation | Route | Controller | Client |
|-----------|-------|------------|--------|
| **Create** | `POST /api/incidents` | `incidentController.js` → `createIncident` (~line 9) | `client/js/incidents.js` (form submit) |
| **Read list** | `GET /api/incidents` | `getAllIncidents` (~line 75) — search, filter, pagination | `incidents.js` list view |
| **Read one** | `GET /api/incidents/:id` | `getIncidentById` | detail panel in `incidents.js` |
| **Update** | `PUT /api/incidents/:id` | `updateIncident` — status + timeline entry | edit form in `incidents.js` |
| **Delete** | `DELETE /api/incidents/:id` | `deleteIncident` — Admin only | delete button (admin) |
| **Comment** | `POST /api/incidents/:id/comments` | `addComment` | comment box on detail view |

**Routes file to open first:** `server/routes/incidentRoutes.js` (lines 24–33 show all CRUD + RBAC)

---

## 4. Authentication & RBAC (Report §7)

| What professor asks | Open this file | What to show |
|---------------------|----------------|--------------|
| Login / register | `server/controllers/authController.js` | JWT sign on login |
| JWT middleware | `server/middleware/authMiddleware.js` | `protect` + `restrictTo` |
| Who can delete? | `server/routes/incidentRoutes.js` line 33 | `restrictTo('Administrator')` |
| Frontend login UI | `client/js/auth.js` | Form + token in localStorage |
| Input validation | `server/middleware/validators.js` | express-validator rules |
| Password security | `server/models/User.js` | bcrypt hash (OWASP practice) |

**Demo tip:** Log in as `guest@platform.com` → try delete → show **403** in browser Network tab. Then log in as `ops@platform.com` → delete works.

---

## 5. Dashboard & Additional Features (Report §7)

| Feature | Code location |
|---------|---------------|
| KPI cards + charts | `client/js/dashboard.js` |
| Chart.js loading | `client/js/chart-loader.js` |
| Metrics API | `incidentController.js` → `getMetrics` |
| Infra health panels | `server/controllers/observabilityController.js` |
| Search debounce | `client/js/incidents.js` (search input handler) |
| Dark / light theme | `client/js/theme.js` + `client/css/app.css` |
| Responsive layout | `client/css/app.css` (media queries) |
| SPA routing | `client/js/router.js` + `client/index.html` |

---

## 6. Security (Report §3.2 / §7)

| Control | File |
|---------|------|
| Helmet headers | `server/server.js` lines 28–39 |
| Rate limiting | `server/server.js` lines 44–52 |
| JWT auth | `server/middleware/authMiddleware.js` |
| Webhook secret (no JWT) | `server/middleware/webhookAuth.js` |
| Global error handler | `server/middleware/errorHandler.js` |

---

## 7. External API Integration (Report §9)

| What professor asks | Open this file | What to show |
|---------------------|----------------|--------------|
| Webhook from CloudWatch | `server/routes/incidentRoutes.js` line 19 | `POST /webhook` with `webhookAuth` |
| Ingest alert handler | `incidentController.js` → `ingestCloudAlert` (~line 48) | Creates incident with `source: 'CloudWebhook'` |
| Optional cost API | `server/controllers/costController.js` | `COST_API_URL` env var + fallback data |
| Frontend API module | `client/js/api.js` | All REST calls in one place |

**Webhook test command:**
```bash
curl -X POST http://localhost:5000/api/incidents/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_WEBHOOK_SECRET" \
  -d '{"title":"EC2 CPU spike","cloudProvider":"AWS","affectedService":"EC2","severity":"High"}'
```

---

## 8. Testing & Deployment (Report §8 / §10)

| Topic | Location |
|-------|----------|
| Health check | `server/server.js` → `GET /api/health` |
| Seed demo users | `server/seedUsers.js` |
| Seed sample incidents | `server/seedIncidents.js` |
| AWS deploy steps | `docs/aws-deployment.md` |
| Nginx / PM2 config | `deploy/` folder |
| Requirements doc | `docs/requirements.md` |

---

## 9. Likely professor questions → one-line answers

| Question | Answer + file |
|----------|---------------|
| Why MongoDB not SQL? | Nested `timeline` and `comments` arrays fit one document — `server/models/Incident.js` |
| Where is REST? | `server/routes/*.js` — HTTP verbs map to controller functions |
| Where is validation? | `server/middleware/validators.js` before controller runs |
| How does Socket.IO work? | Server emits after save in `incidentController.js`; client listens in `app.js` |
| Where is the SPA entry? | `client/index.html` loads `client/js/app.js` as ES module |
| How do roles work? | JWT payload includes `role`; `restrictTo()` checks it on every protected route |

---

## Demo accounts

| Email | Role | Password |
|-------|------|----------|
| `ops@platform.com` | Administrator | `SecurePassword123` |
| `engineer@platform.com` | User | `SecurePassword123` |
| `guest@platform.com` | Guest | `SecurePassword123` |

**GitHub:** https://github.com/MShabade/cloud-incident-monitoring-system
