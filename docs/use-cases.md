# Use Cases

## UC-01 User Registration

Actor:
Guest User

Description:
Allows a new user to create an account via the registration API.

Preconditions:
User is not authenticated.

Postconditions:
User account created successfully (default role: User; Administrator cannot be self-assigned).

Implementation:
`POST /api/auth/register` — `server/controllers/authController.js`, `server/routes/authRoutes.js`

Status: **Implemented** (API; no dedicated registration UI in the client — users are seeded for demo via `server/seedUsers.js`)

---

## UC-02 User Login

Actor:
Registered User

Description:
Allows users to authenticate and receive access to protected functionality.

Preconditions:
Valid account exists.

Postconditions:
JWT token issued and stored client-side; main application shell displayed.

Implementation:
Login form in `client/index.html`, `client/js/auth.js`, `POST /api/auth/login`

Status: **Implemented**

---

## UC-03 Create Incident

Actor:
User or Administrator

Description:
Create a new cloud infrastructure incident with multi-cloud metadata (provider, region, service, severity, team assignment).

Preconditions:
Authenticated user with role User or Administrator (Guest cannot create).

Postconditions:
Incident stored in database with auto-generated ID (`INC-YYYY-####`), SLA deadline, and initial timeline entry; all clients notified via Socket.IO.

Implementation:
`client/js/incidents.js`, `POST /api/incidents`, `server/models/Incident.js`

Status: **Implemented**

---

## UC-04 Update Incident

Actor:
User or Administrator

Description:
Update incident status, severity, root cause analysis, and add comments. Timeline entries are recorded automatically.

Preconditions:
Authenticated user with modify permission (not Guest).

Postconditions:
Incident updated; timeline extended; clients refreshed in real time.

Implementation:
Incident detail view in `client/js/incidents.js`, `PUT /api/incidents/:id`, `POST /api/incidents/:id/comments`

Status: **Implemented**

---

## UC-05 Manage Users

Actor:
Administrator

Description:
Manage platform users and permissions (create users, change roles, deactivate accounts).

Preconditions:
Administrator account.

Postconditions:
User roles and accounts updated.

Implementation:
Not implemented as a dedicated admin UI or `/api/users` routes. Demo users are created via `server/seedUsers.js`. Registration API exists but does not expose full user management.

Status: **Not implemented** (planned / out of scope for current release)

---

## UC-06 View Audit Logs

Actor:
Administrator (and all authenticated users for incident-level history)

Description:
Review platform activities for compliance and security monitoring.

Preconditions:
Authenticated user.

Postconditions:
Audit/history data displayed.

Implementation:
**Partial** — each incident maintains an embedded **timeline** (status changes, comments, detection events) and **comments** array in `server/models/Incident.js`, rendered on the incident detail page. There is no separate global audit-log collection or admin audit dashboard.

Status: **Partially implemented** (incident-level audit trail; global audit log UI not built)

---

## UC-07 Ingest Cloud Alert (Webhook)

Actor:
External monitoring system (CloudWatch, Azure Monitor, etc.)

Description:
Automatically create an incident from a cloud monitoring alert without JWT authentication.

Preconditions:
Valid `x-webhook-secret` header matching `WEBHOOK_SECRET` in server environment.

Postconditions:
Incident created with `source: CloudWebhook`; clients notified in real time.

Implementation:
`POST /api/incidents/webhook`, `server/middleware/webhookAuth.js`, `ingestCloudAlert` in `server/controllers/incidentController.js`

Status: **Implemented**

---

## UC-08 View Operations Dashboard

Actor:
Any authenticated user (Guest, User, Administrator)

Description:
View KPIs, charts, infrastructure health, service status, and recent incidents.

Preconditions:
Authenticated user.

Postconditions:
Dashboard displayed with live and simulated metrics; auto-refreshes every 30 seconds and on Socket.IO events.

Implementation:
`client/js/dashboard.js`, `GET /api/observability/dashboard`, `GET /api/incidents/metrics`

Status: **Implemented**
