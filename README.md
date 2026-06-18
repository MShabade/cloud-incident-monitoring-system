# Cloud Incident Monitoring and Response Platform

## Project Overview

Cloud Incident Monitoring and Response Platform is a role-based web application designed to support cloud operations teams in tracking, managing, and resolving infrastructure incidents across cloud-hosted environments.

The platform provides centralized incident reporting, monitoring dashboards, audit logging, and secure access controls to improve operational visibility and incident response processes.

---

## Business Problem

Organizations operating cloud infrastructure often struggle to manage incidents consistently across teams.

Without centralized tracking, organizations face:

* Delayed incident resolution
* Limited operational visibility
* Lack of auditability
* Weak access controls
* Inefficient communication during outages

This project addresses these challenges through a secure cloud-native incident management platform.

---

## Project Objectives

* Implement role-based access control
* Centralize incident management
* Provide monitoring dashboards
* Maintain audit trails
* Improve security and accountability
* Demonstrate modern full-stack JavaScript architecture

---

## User Roles

### Guest

* View public platform information
* Register
* Login

### User

* Create incidents
* Update assigned incidents
* View dashboards

### Administrator

* Manage users
* Manage incidents
* Review audit logs
* Access administrative dashboards

---

## Technology Stack

### Frontend

* Vanilla JavaScript (ES modules)
* Chart.js
* Custom CSS design system

### Backend

* Node.js
* Express.js
* Socket.IO

### Database

* MongoDB Atlas

### Security

* JWT Authentication
* Role-Based Access Control
* Password Hashing
* Helmet
* Rate Limiting

### Cloud Infrastructure

* AWS EC2
* Nginx
* PM2

---

## Development Methodology

This project follows an incremental Agile development approach using GitHub for source control and iterative feature delivery.

---

## Local Development

```bash
cd server
cp .env.example .env   # add MONGO_URI and JWT_SECRET
npm install
npm run seed:users
npm run seed:incidents
npm run dev
```

Open `http://localhost:5000` in the browser. Demo logins are created by the seed script (`ops@platform.com`, `engineer@platform.com`, `guest@platform.com`).
