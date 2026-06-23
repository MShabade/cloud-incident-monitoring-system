# Requirements Analysis

## Problem Statement

Cloud infrastructure incidents can negatively impact service availability, business operations, and customer experience. Organizations require a centralized platform to track incidents, monitor status, and coordinate resolution activities securely.

---

## Stakeholders

### System Administrator

Responsible for managing users, permissions, and platform configuration.

### Cloud Operations Team

Responsible for monitoring and resolving incidents.

### End Users

Responsible for reporting issues and monitoring incident status.

---

## Functional Requirements

| ID | Requirement | Status | Implementation |
|----|-------------|--------|----------------|
| FR1 | User Registration | Implemented | `POST /api/auth/register`, `authController.js` (API only; demo users via `seedUsers.js`) |
| FR2 | User Authentication | Implemented | JWT login, `auth.js`, `authMiddleware.js` |
| FR3 | Incident Creation | Implemented | Create form, `POST /api/incidents`, auto ID + SLA |
| FR4 | Incident Update | Implemented | Detail view, `PUT /api/incidents/:id`, comments API |
| FR5 | Incident Assignment | Implemented | Team and owner fields on incident model and forms |
| FR6 | Incident Resolution | Implemented | Status workflow to `Resolved`; `resolvedAt` timestamp |
| FR7 | Dashboard Reporting | Implemented | `dashboard.js`, observability + metrics APIs, Chart.js |
| FR8 | Audit Logging | Partial | Incident **timeline** and comments (no global audit log UI) |
| FR9 | Role-Based Access Control | Implemented | JWT + `restrictTo` middleware; Guest/User/Admin roles |

Additional implemented capabilities (beyond original FR list):

| Feature | Status | Implementation |
|---------|--------|----------------|
| Real-time incident updates | Implemented | Socket.IO in `config/socket.js`, `app.js` |
| Cloud webhook alert ingestion | Implemented | `POST /api/incidents/webhook`, `webhookAuth.js` |
| Multi-cloud incident taxonomy | Implemented | `shared-taxonomy.js`, `config.js`, validators |
| SLA tracking and breach metrics | Implemented | `SLA_TARGETS`, `slaRemaining()`, metrics API |
| Simulated observability metrics | Implemented | `observabilityController.js` |
| Simulated cost/utilization API | Implemented | `costController.js` (optional `COST_API_URL`) |

Not implemented in current release:

| Feature | Status | Notes |
|---------|--------|-------|
| Admin user management UI | Not implemented | UC-05; users seeded manually |
| Global audit log dashboard | Not implemented | UC-06 partial; per-incident timeline only |
| Dedicated registration UI | Not implemented | Login UI only; register via API |

---

## Non-Functional Requirements

| ID | Requirement | How addressed |
|----|-------------|---------------|
| NFR1 | Security | JWT, bcrypt, RBAC, Helmet, rate limiting, input validation, webhook secret |
| NFR2 | Reliability | Centralized error handler, health check endpoint, PM2 in production |
| NFR3 | Availability | Deployed on AWS EC2; MongoDB Atlas managed service |
| NFR4 | Scalability | Stateless API; MongoDB indexes; pagination on incident list |
| NFR5 | Performance | Parallel dashboard API calls; debounced search; chart lazy-load |
| NFR6 | Maintainability | Modular routes/controllers; shared taxonomy; ES module frontend |

---

## Technology Stack (As Built)

| Layer | Technologies |
|-------|--------------|
| Frontend | HTML5, Vanilla JavaScript (ES modules), CSS, Chart.js, Socket.IO client |
| Backend | Node.js, Express.js, Socket.IO, Mongoose |
| Database | MongoDB Atlas |
| Deployment | AWS EC2, Nginx, PM2 |
