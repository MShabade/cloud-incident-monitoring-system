# Learning Log

## 08 June 2026

### Topic

Project Planning and Requirements Engineering

### Learning Outcome

Learned how to:

* Define stakeholders
* Identify functional requirements
* Identify non-functional requirements
* Structure a software project repository

### Sources

* Atlassian Agile Project Management Resources
* Software Engineering Requirements Engineering Concepts

---

## 08 June 2026

### Topic

System Architecture Design

### Learning Outcome

Learned how to:

* Design a three-tier architecture (Presentation, Application, Data)
* Define application layers and separation of concerns
* Apply Role-Based Access Control concepts
* Plan secure cloud deployment architecture

### Sources

* Express.js Documentation
* MongoDB Atlas Documentation
* Node.js full-stack architecture references

---

## 15 June 2026

### Topic

Backend API and Data Modelling

### Learning Outcome

Learned how to:

* Model users and incidents with Mongoose schemas and validation enums
* Implement JWT authentication and bcrypt password hashing
* Use Express middleware for authorization (`protect`, `restrictTo`) and input validation
* Centralize incident taxonomy in `shared-taxonomy.js` for consistency across schema, validators, and client

### Sources

* Mongoose Documentation
* Express.js middleware guide
* JWT.io introduction

---

## 22 June 2026

### Topic

Frontend SPA and Real-Time Updates

### Learning Outcome

Learned how to:

* Build a single-page application with Vanilla JavaScript ES modules (no React build step)
* Implement client-side routing and modular API layer with the Fetch API
* Integrate Chart.js for operational dashboards
* Use Socket.IO to push incident create/update/delete events to all connected clients
* Apply role-based UI rules (hide create/edit for Guest users)

### Sources

* MDN JavaScript Modules documentation
* Chart.js documentation
* Socket.IO documentation

---

## 23 June 2026

### Topic

Cloud Operations Features and Deployment

### Learning Outcome

Learned how to:

* Auto-generate incident IDs and SLA deadlines from severity levels
* Maintain incident timelines as an audit trail (status, comments, detection)
* Accept external cloud alerts via webhook shared-secret authentication
* Structure observability and cost APIs for future integration with real CloudWatch/billing systems
* Deploy to AWS EC2 with Nginx, PM2, and MongoDB Atlas network access rules

### Sources

* AWS EC2 Documentation
* PM2 process manager documentation
* Project `deploy/` scripts and `docs/aws-deployment.md`

---

## Future Entries

Additional learning activities (e.g. user admin module, global audit log, live CloudWatch integration) will be documented as they are implemented.
