# Risk Assessment

## Project Risks

### R1 - Schedule Risk

Description:
Project tasks may take longer than expected due to unfamiliar technologies and integration complexity.

Impact:
High

Probability:
Medium

Mitigation:

* Follow incremental development approach
* Maintain weekly milestones
* Track progress using GitHub commits

---

### R2 - Security Vulnerabilities

Description:
Improper authentication and authorization implementation may expose sensitive functionality.

Impact:
High

Probability:
Medium

Mitigation:

* Use JWT authentication
* Implement Role-Based Access Control (RBAC)
* Validate all API inputs (express-validator)
* Rate-limit auth and API routes
* Use Helmet security headers
* Webhook endpoints use shared-secret auth instead of JWT
* Perform security testing

---

### R3 - Database Connectivity Issues

Description:
Connectivity problems between the application and MongoDB Atlas.

Impact:
Medium

Probability:
Low

Mitigation:

* Use environment variables for connection strings
* Configure MongoDB Atlas IP allowlist for EC2 deployment
* Health check endpoint (`GET /api/health`) reports DB connection state
* Seed scripts for reproducible demo data

---

### R4 - Deployment Failures

Description:
Application deployment on AWS EC2 may encounter configuration issues.

Impact:
Medium

Probability:
Medium

Mitigation:

* Use documented deployment procedures (`docs/aws-deployment.md`, `deploy/install.sh`)
* Test locally before deployment (`npm run dev` on port 5000)
* Use PM2 process management and Nginx reverse proxy
* Copy `.env` securely to the server (never commit secrets)

---

### R5 - Knowledge Gap Risk

Description:
Limited prior experience with Node.js full-stack development (Express, MongoDB, Socket.IO, vanilla SPA patterns).

Impact:
Medium

Probability:
High

Mitigation:

* Follow official documentation (Express, Mongoose, Socket.IO, MDN)
* Maintain learning log (`docs/learning-log.md`)
* Build features incrementally (auth → incidents → dashboard → real-time → deploy)
* Keep documentation aligned with actual implementation

---

### R6 - Documentation Drift

Description:
Early planning documents may describe technologies or features that differ from the final implementation (e.g. planned React frontend vs delivered Vanilla JS SPA).

Impact:
Low

Probability:
Medium

Mitigation:

* Review docs against codebase before submission
* Mark use cases as Implemented / Partial / Not implemented
* Update architecture and references when stack decisions change
