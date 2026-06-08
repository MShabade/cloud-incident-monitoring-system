# System Architecture

## Overview

The Cloud Incident Monitoring and Response Platform follows a three-tier architecture consisting of a Presentation Layer, Application Layer, and Data Layer.

The architecture is designed to support secure user authentication, role-based access control, incident management, monitoring capabilities, and cloud deployment.

---

## Architecture Layers

### Presentation Layer

Technology:

* React
* React Router
* Axios

Responsibilities:

* User Interface
* Dashboard Visualization
* Incident Management Screens
* Authentication Screens

---

### Application Layer

Technology:

* Node.js
* Express.js

Responsibilities:

* Business Logic
* Authentication
* Authorization
* Incident Processing
* Audit Logging
* API Management

---

### Data Layer

Technology:

* MongoDB Atlas

Responsibilities:

* User Data Storage
* Incident Storage
* Audit Logs
* System Metadata

---

## Authentication Architecture

User Login

→ Credentials Submitted

→ Password Validation (bcrypt)

→ JWT Token Generated

→ Token Stored Client Side

→ Protected API Access

---

## Authorization Model

Role-Based Access Control (RBAC)

Roles:

Guest

User

Administrator

Permissions are enforced using Express middleware before protected routes are accessed.

---

## Security Architecture

The platform incorporates multiple security controls:

* JWT Authentication
* Password Hashing
* Input Validation
* Rate Limiting
* Security Headers (Helmet)
* Environment Variable Management

---

## Deployment Architecture

Client Application

↓

AWS EC2

↓

Node.js / Express API

↓

MongoDB Atlas

The platform will be deployed on AWS EC2 using PM2 as the process manager and Nginx as the reverse proxy.

