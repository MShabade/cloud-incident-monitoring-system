# System Architecture

## Overview

The Cloud Incident Monitoring and Response Platform follows a three-tier architecture consisting of a Presentation Layer, Application Layer, and Data Layer.

The architecture is designed to support secure user authentication, role-based access control, incident management, real-time updates, monitoring dashboards, and cloud deployment.

---

## Architecture Layers

### Presentation Layer

Technology:

* HTML5 (single-page application shell)
* Vanilla JavaScript (ES modules)
* Custom client-side router (`client/js/router.js`)
* Fetch API for REST calls (`client/js/api.js`)
* Chart.js for dashboard visualizations
* Socket.IO client for real-time incident updates
* Custom CSS design system with dark/light themes

Responsibilities:

* User interface (login, dashboard, incident list, detail, create forms)
* Dashboard visualization (KPIs, charts, infrastructure health panels)
* Incident management screens
* Authentication screens
* Role-based UI visibility (Guest vs User vs Administrator)

Key files: `client/index.html`, `client/js/`, `client/css/app.css`

---

### Application Layer

Technology:

* Node.js
* Express.js
* Socket.IO
* Mongoose ODM
* express-validator, Helmet, express-rate-limit

Responsibilities:

* Business logic and REST API (`/api/auth`, `/api/incidents`, `/api/observability`, `/api/cost`)
* JWT authentication and RBAC authorization
* Incident CRUD, comments, metrics, and timeline/audit entries
* Cloud webhook alert ingestion (shared-secret auth, not JWT)
* Simulated observability and cost metrics (extensible for external APIs)
* Centralized error handling and input validation
* Static serving of the client and Chart.js vendor bundle

Key files: `server/server.js`, `server/controllers/`, `server/routes/`, `server/middleware/`, `server/shared-taxonomy.js`

---

### Data Layer

Technology:

* MongoDB Atlas

Responsibilities:

* User data storage (`User` model)
* Incident storage with embedded timeline and comments (`Incident` model)
* Indexed queries for status, severity, and text search

Key files: `server/db.js`, `server/models/`

---

## Real-Time Architecture

```
Incident created/updated/deleted (controller)
        ↓
Socket.IO emit (incident:created | incident:updated | incident:deleted)
        ↓
All connected browser clients receive event
        ↓
Dashboard / incident list / detail view refreshes automatically
```

Socket.IO is initialized in `server/config/socket.js` and consumed in `client/js/app.js`.

---

## Webhook Ingestion Architecture

Cloud monitoring systems (e.g. CloudWatch, Azure Monitor) cannot use JWT login. Instead:

```
External alert → POST /api/incidents/webhook
              → Header: x-webhook-secret (matches WEBHOOK_SECRET in .env)
              → ingestCloudAlert creates incident with source: CloudWebhook
              → Socket.IO broadcasts to all clients
```

---

## Authentication Architecture

User Login

→ Credentials submitted (`POST /api/auth/login`)

→ Password validation (bcrypt via `User.comparePassword`)

→ JWT token generated (24h expiry, payload: user id + role)

→ Token stored client-side (`localStorage`)

→ Protected API access (`Authorization: Bearer <token>`)

---

## Authorization Model

Role-Based Access Control (RBAC)

Roles:

* **Guest** — view incidents and dashboard; cannot create or modify
* **User** — create/update incidents, add comments, document root cause
* **Administrator** — full access including incident deletion

Permissions are enforced using Express middleware (`protect`, `restrictTo`) before protected routes are accessed. The client also hides create/edit controls based on role.

---

## Shared Taxonomy

`server/shared-taxonomy.js` is the single source of truth for incident enums (severity, status, cloud providers, regions, teams, SLA targets). The same values are mirrored on the client in `client/js/config.js` and validated server-side in `server/middleware/validators.js` and the Mongoose schema.

---

## Security Architecture

The platform incorporates multiple security controls:

* JWT authentication
* Password hashing (bcrypt, salt rounds: 10)
* Role-based access control
* Input validation and sanitization (express-validator)
* Rate limiting (auth routes: 20/15min; API: 300/15min)
* Security headers (Helmet + Content Security Policy)
* Webhook shared-secret authentication
* Environment variable management (`.env` — never committed)
* Registration cannot self-assign Administrator role

---

## Deployment Architecture

```
Browser
   ↓
Nginx (reverse proxy, port 80)
   ↓
AWS EC2 — PM2 runs Node.js / Express + Socket.IO
   ↓
MongoDB Atlas (cloud database)
```

The Express server also serves the static client from `client/` so the demo can run from a single origin (`http://localhost:5000` locally).

Deployment scripts: `deploy/install.sh`, `deploy/ecosystem.config.cjs`, `deploy/nginx-cloudops.conf`

See `docs/aws-deployment.md` for step-by-step EC2 setup.
