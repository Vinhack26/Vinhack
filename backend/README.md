# BreachBuddy Backend API Server

[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-4.21.2-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15%2B-blue.svg)](https://www.postgresql.org/)

**BreachBuddy** is an AI-powered data-breach response application designed to help individuals, colleges, startups, clubs, and small organizations understand, assess, and respond to suspected data breaches.

This repository contains the complete, production-ready backend service providing RESTful APIs for authentication, incident lifecycle management, AI-driven triage analysis, action checklist execution, timeline tracking, notification drafting, forensic notes & evidence references, and downloadable PDF report generation.

---

## Architecture Overview

```
breachbuddy-server/
│
├── database/
│   ├── schema.sql           # PostgreSQL DDL table schema definitions & indexes
│   └── seed.sql             # Realistic seed data for development & testing
│
├── src/
│   ├── config/
│   │   ├── database.js      # PostgreSQL pg-pool connection & query wrapper
│   │   └── env.js           # Environment variable validation & defaults
│   │
│   ├── controllers/         # HTTP request handlers
│   │   ├── authController.js
│   │   ├── incidentController.js
│   │   ├── checklistController.js
│   │   ├── timelineController.js
│   │   ├── notesController.js
│   │   ├── notificationController.js
│   │   ├── reportController.js
│   │   └── evidenceController.js
│   │
│   ├── routes/              # Express API route declarations
│   │   ├── authRoutes.js
│   │   ├── incidentRoutes.js
│   │   ├── checklistRoutes.js
│   │   ├── timelineRoutes.js
│   │   ├── notesRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── reportRoutes.js
│   │   └── evidenceRoutes.js
│   │
│   ├── middleware/          # Security, Auth, Validation & Error Middlewares
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validationMiddleware.js
│   │
│   ├── services/            # Core business logic services
│   │   ├── aiService.js     # Gemini API integration & Mock AI fallback provider
│   │   ├── incidentService. # Aggregated incident query fetcher
│   │   └── pdfService.js    # Standalone PDF report generator (PDFKit)
│   │
│   ├── validators/          # Zod schema definitions for request bodies
│   │   ├── authValidator.js
│   │   ├── incidentValidator.js
│   │   ├── checklistValidator.js
│   │   ├── timelineValidator.js
│   │   ├── notesValidator.js
│   │   ├── evidenceValidator.js
│   │   └── notificationValidator.js
│   │
│   ├── utils/
│   │   └── response.js      # Standardized API response formatters
│   │
│   ├── app.js               # Express application configuration
│   └── server.js            # Server entrypoint
│
├── tests/                   # Automated Jest test suites
│   ├── auth.test.js
│   ├── incident.test.js
│   ├── checklist.test.js
│   └── ai.test.js
│
├── .env.example
├── .gitignore
├── API_DOCUMENTATION.md     # Complete API contract for frontend team
├── breachbuddy_postman_collection.json
├── package.json
└── README.md
```

---

## Quick Start & Installation

### 1. Prerequisites
- **Node.js**: `v20.0.0` or higher
- **PostgreSQL**: `v14` or higher

### 2. Install Dependencies
Navigate into the server directory and install packages:
```bash
cd breachbuddy-server
npm install
```

### 3. Environment Setup
Copy `.env.example` to create `.env`:
```bash
cp .env.example .env
```
Edit `.env` as required:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/breachbuddy
JWT_SECRET=breachbuddy_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
LLM_API_KEY=
LLM_MODEL=gemini-2.5-flash
```

> **Note:** If `LLM_API_KEY` is omitted or left empty, the server automatically utilizes the built-in **Mock AI Service**, ensuring seamless offline testing without external API key dependencies.

### 4. Database Initialization
Create the database and apply `schema.sql` and `seed.sql`:

Using `psql`:
```bash
createdb breachbuddy
psql -d breachbuddy -f database/schema.sql
psql -d breachbuddy -f database/seed.sql
```

Default Seed Credentials:
- **Email:** `demo@breachbuddy.org`
- **Password:** `Password123!`

### 5. Run Development Server
```bash
npm run dev
```
The server will start at: `http://localhost:5000`

Check health status:
`GET http://localhost:5000/api/health`

### 6. Run Automated Tests
```bash
npm test
```

---

## Main API Summary

| Category | Endpoint | Method | Description |
|---|---|---|---|
| **Auth** | `/api/auth/register` | `POST` | Register a new user account |
| **Auth** | `/api/auth/login` | `POST` | Authenticate user & receive JWT token |
| **Auth** | `/api/auth/me` | `GET` | Fetch authenticated user profile |
| **Incidents** | `/api/incidents` | `POST` | Create a new breach incident record |
| **Incidents** | `/api/incidents` | `GET` | Get all incidents for logged-in user |
| **Incidents** | `/api/incidents/:id` | `GET` | Get single incident with full composite data |
| **Incidents** | `/api/incidents/:id` | `PATCH` | Update incident status or details |
| **Incidents** | `/api/incidents/:id` | `DELETE` | Delete incident (user isolated) |
| **AI Triage** | `/api/incidents/:id/analyze` | `POST` | Execute AI breach triage analysis |
| **Checklist** | `/api/incidents/:id/checklist` | `GET` | Get tasks & progress statistics |
| **Checklist** | `/api/incidents/:id/checklist` | `POST` | Add task to incident checklist |
| **Checklist** | `/api/checklist/:taskId` | `PATCH` | Update task status or priority |
| **Checklist** | `/api/checklist/:taskId` | `DELETE` | Delete task |
| **Timeline** | `/api/incidents/:id/timeline` | `GET` | Get chronological events |
| **Timeline** | `/api/incidents/:id/timeline` | `POST` | Record timeline event |
| **Notification**| `/api/incidents/:id/notification/generate` | `POST` | Generate verified stakeholder advisory draft |
| **Report PDF** | `/api/incidents/:id/report/pdf` | `GET` | Download multi-page PDF Incident Report |

For full endpoint documentation, payload formats, and examples, refer to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

---

## Postman Collection

Import `breachbuddy_postman_collection.json` into Postman to instantly test all endpoints.

---

## Security Features
- **JWT Authentication:** Stateful token verification with automatic expiration check.
- **Password Security:** Salted `bcryptjs` password hashing with strength parameters.
- **SQL Injection Prevention:** 100% parameterized queries via `pg`.
- **Validation:** Strict runtime body and parameter parsing using `zod`.
- **Security Headers & Protection:** Configured with `helmet`, `cors`, and `express-rate-limit`.
- **Privacy:** User authorization enforces strict multi-tenant boundary checks.
