# Medidoc API

A production-ready Electronic Health Records (EHR) REST API built with Node.js, Express, TypeScript, and PostgreSQL. Medidoc serves three client types, a patient app, a clinical dashboard, and a provider portal, all secured with JWT-based authentication and fine-grained access control.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Overview](#api-overview)
- [Scripts](#scripts)
- [Docker](#docker)
- [Code Quality](#code-quality)
- [Contributing](#contributing)

---

## Features

- **Role-based access control**, patients, practitioners, organization admins, and platform admins each have scoped permissions
- **Hybrid authentication**, local credentials (email + password with Argon2 hashing) and OAuth 2.0 (Google, GitHub) via Passport.js
- **JWT + refresh token flow**, 15-minute access tokens, long-lived refresh tokens, and secure logout
- **OTP email verification**, required on registration before account activation
- **Patient health records**, episodes of care, clinical entries, medical summaries with full version history
- **Access control for records**, patients explicitly grant and revoke access to their records per organization or per practitioner
- **Appointments & invoicing**, schedule appointments, check-in, raise invoices, and record payments
- **Consent forms**, attach and retrieve patient consent documents
- **Organization onboarding**, organizations register and await platform-level verification before going live
- **Audit logs**, platform-wide audit trail for sensitive operations
- **File uploads**, Cloudinary integration for document and image storage
- **Email delivery**, Nodemailer and Resend support for transactional emails
- **Rate limiting & security headers**, express-rate-limit and Helmet configured out of the box
- **Structured logging**, Pino with pretty-printing in development
- **OpenAPI / Swagger docs**, auto-generated and served at runtime

---

## Tech Stack

| Layer            | Technology                 |
| ---------------- | -------------------------- |
| Runtime          | Node.js 18+                |
| Framework        | Express 5                  |
| Language         | TypeScript                 |
| Database         | PostgreSQL                 |
| ORM              | Drizzle ORM                |
| Cache / Sessions | Redis                      |
| Authentication   | Passport.js, JWT, Argon2   |
| Validation       | Zod                        |
| File Storage     | Cloudinary                 |
| Email            | Nodemailer, Resend         |
| Logging          | Pino                       |
| API Docs         | Swagger / OpenAPI 3.0      |
| Containerization | Docker (multi-stage build) |

---

## Architecture

```
src/
├── configs/          # Database, Redis, Cloudinary, and app config
├── controllers/      # Route handlers (thin, delegate to services)
├── services/         # Business logic
├── routes/           # Express router definitions
├── middlewares/      # Auth, error handling, rate limiting, etc.
├── validators/       # Zod schemas for request validation
├── helpers/          # Shared utility functions
├── types/            # TypeScript interfaces and type definitions
├── drizzle/          # Drizzle schema, migrations, and queries
├── seed/             # Database seeding scripts
├── email-templates/  # EJS templates for transactional emails
├── docs/             # Swagger/OpenAPI generated output
├── utils/            # Miscellaneous utilities
└── server.ts         # Entry point
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/medidoc-api.git
cd medidoc-api

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# 4. Run database migrations
npm run db:migrate

# 5. (Optional) Seed the database
npm run seed

# 6. Start the development server
npm run dev
```

The server starts on `http://localhost:4000` by default. Swagger docs are available at `http://localhost:4000/api/v1/docs`.

---

## Environment Variables

Create a `.env` file at the project root. The following variables are required:

```env
# App
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/medidoc

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth, Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# OAuth, GitHub
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Resend)
RESEND_API_KEY=

# Email (Nodemailer / SMTP fallback)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

> **Never commit `.env` or any file containing secrets.**

---

## Database

Drizzle ORM is used for schema management and migrations.

```bash
# Generate a migration from schema changes
npm run db:generate

# Apply pending migrations
npm run db:migrate

# Push schema directly to the database (dev only)
npm run db:push

# Open Drizzle Studio (visual DB browser)
npm run db:studio
```

---

## API Overview

All routes are prefixed with `/api/v1`. Authenticated routes require a `Bearer` access token in the `Authorization` header. Access tokens expire after **15 minutes**, use `POST /auth/refresh` to obtain a new one.

### Health

| Method | Endpoint           | Description                       |
| ------ | ------------------ | --------------------------------- |
| GET    | `/health`          | Basic liveness check              |
| GET    | `/health/detailed` | Health check with dependency info |

### Authentication

| Method | Endpoint                       | Description                             |
| ------ | ------------------------------ | --------------------------------------- |
| POST   | `/auth/register/patient`       | Register a new patient                  |
| POST   | `/auth/register/organization`  | Register a new provider organization    |
| POST   | `/auth/verify`                 | Verify account via OTP                  |
| POST   | `/auth/login`                  | Login (returns access + refresh tokens) |
| POST   | `/auth/refresh`                | Refresh access token                    |
| POST   | `/auth/logout`                 | Invalidate current session              |
| GET    | `/auth/profile`                | Get authenticated user profile          |
| PATCH  | `/auth/profile`                | Update profile (supports avatar upload) |
| GET    | `/auth/sessions`               | List all active sessions                |
| DELETE | `/auth/sessions`               | Revoke all sessions                     |
| DELETE | `/auth/sessions/:sessionId`    | Revoke a specific session               |
| POST   | `/auth/forgot-password`        | Request a password reset OTP            |
| POST   | `/auth/verify-reset-otp`       | Verify password reset OTP               |
| POST   | `/auth/reset-password`         | Set a new password after OTP verify     |
| POST   | `/auth/change-password`        | Change password (authenticated)         |
| POST   | `/auth/account/request-delete` | Initiate account deletion               |
| DELETE | `/auth/account/delete`         | Confirm and delete account              |
| PUT    | `/auth/account/reactivate`     | Reactivate a deactivated account        |

### OAuth (no `/api/v1` prefix)

| Method | Endpoint                | Description                |
| ------ | ----------------------- | -------------------------- |
| GET    | `/auth/github`          | Initiate GitHub OAuth flow |
| GET    | `/auth/github/callback` | GitHub OAuth callback      |
| GET    | `/auth/google`          | Initiate Google OAuth flow |
| GET    | `/auth/google/callback` | Google OAuth callback      |

### Patients

| Method | Endpoint        | Description             |
| ------ | --------------- | ----------------------- |
| GET    | `/patients/me`  | Get own patient profile |
| GET    | `/patients/:id` | Get patient by ID       |
| PATCH  | `/patients/:id` | Update patient profile  |

### Records & Episodes

| Method   | Endpoint                         | Description                      |
| -------- | -------------------------------- | -------------------------------- |
| GET/POST | `/patients/:id/episodes`         | List or create care episodes     |
| POST     | `/episodes/:id/close`            | Close an active episode          |
| GET/POST | `/patients/:id/clinical-entries` | List or create clinical entries  |
| GET/POST | `/patients/:id/summaries`        | List or create medical summaries |
| PATCH    | `/summaries/:id`                 | Update a summary                 |
| GET      | `/summaries/:id/versions`        | View summary version history     |

### Access Control

| Method   | Endpoint                                              | Description                       |
| -------- | ----------------------------------------------------- | --------------------------------- |
| GET/POST | `/patients/:id/organization-access`                   | Manage organization access grants |
| POST     | `/patients/:id/organization-access/:accessId/revoke`  | Revoke organization access        |
| GET/POST | `/patients/:id/practitioner-access`                   | Manage practitioner access grants |
| POST     | `/patients/:id/practitioner-access/:accessId/revoke`  | Revoke practitioner access        |

### Appointments

| Method   | Endpoint                                             | Description                 |
| -------- | ---------------------------------------------------- | --------------------------- |
| GET/POST | `/patients/:id/appointments`                         | List or book appointments   |
| POST     | `/appointments/:id/check-in`                         | Check in for an appointment |
| PATCH    | `/patients/:id/appointments/:appointmentId/cancel`   | Cancel an appointment       |

### Invoices & Payments

| Method   | Endpoint                                      | Description              |
| -------- | --------------------------------------------- | ------------------------ |
| GET/POST | `/patients/:id/invoices`                      | List or create invoices  |
| POST     | `/invoices/:id/payments`                      | Record a payment         |
| PATCH    | `/patients/:id/invoices/:invoiceId/mark-paid` | Mark invoice as paid     |
| GET      | `/patients/:id/invoices/:invoiceId/payments`  | List payments on invoice |

### Consent Forms

| Method   | Endpoint                                                  | Description           |
| -------- | --------------------------------------------------------- | --------------------- |
| GET/POST | `/patients/:id/consent-forms`                             | List or submit forms  |
| PATCH    | `/patients/:id/consent-forms/:consentFormId/sign`         | Patient signs a form  |

### Organization & Provider Management

| Method   | Endpoint                                                         | Description                         |
| -------- | ---------------------------------------------------------------- | ----------------------------------- |
| GET      | `/organizations/public`                                          | List publicly visible organizations |
| GET/POST | `/organizations/:id/admins`                                      | List or invite organization admins  |
| POST     | `/admins/:id/approve`                                            | Approve an admin                    |
| GET/POST | `/organizations/:id/practitioners`                               | List or add practitioners           |
| POST     | `/practitioners/:id/approve`                                     | Approve a practitioner              |
| GET      | `/organizations/:id/practitioners/public`                        | List public practitioners           |
| GET      | `/organizations/:id/practitioners/:practitionerId/availability`  | Get practitioner availability       |
| GET      | `/organizations/:id/patients`                                    | List patients in an organization    |
| GET      | `/organizations/:id/appointments`                                | List organization appointments      |
| GET      | `/organizations/:id/invoices`                                    | List organization invoices          |

### Platform Administration

| Method | Endpoint                              | Description                  |
| ------ | ------------------------------------- | ---------------------------- |
| GET    | `/platform/organizations`             | List all organizations       |
| GET    | `/platform/stats`                     | Platform-wide statistics     |
| POST   | `/platform/organizations/:id/verify`  | Verify an organization       |
| POST   | `/platform/organizations/:id/suspend` | Suspend an organization      |
| POST   | `/platform/organizations/:id/reinstate` | Reinstate a suspended org  |
| GET    | `/audit-logs`                         | Retrieve platform audit logs |

Full interactive documentation is available via Swagger UI at `GET /api/v1/docs`.

---

## Scripts

```bash
npm run dev           # Start development server with hot reload
npm run build         # Compile TypeScript to dist/
npm start             # Run the compiled production build

npm run seed          # Seed the database with sample data

npm run db:generate   # Generate Drizzle migrations
npm run db:migrate    # Apply migrations
npm run db:push       # Push schema without migration files
npm run db:studio     # Open Drizzle Studio

npm run docs          # Regenerate Swagger output

npm run typecheck     # Type-check source
npm run lint:check    # Lint without fixing
npm run lint:fix      # Lint and auto-fix
npm run format:check  # Check formatting
npm run format:fix    # Auto-format with Prettier
```

---

## Docker

A multi-stage Dockerfile is included for production builds.

```bash
# Build the image
docker build -t medidoc-api .

# Run the container
docker run -p 4000:4000 --env-file .env medidoc-api
```

---

## Code Quality

This project enforces consistent code style and commit conventions through:

- **ESLint**, TypeScript-aware linting rules
- **Prettier**, opinionated code formatting
- **Husky**, Git hooks to run checks before commits
- **lint-staged**, runs ESLint and Prettier only on staged files
- **Commitlint**, enforces [Conventional Commits](https://www.conventionalcommits.org/) format

---

## Contributing

1. Fork the repository and create a feature branch from `main`
2. Follow the [Conventional Commits](https://www.conventionalcommits.org/) spec for all commit messages
3. Ensure `npm run typecheck` and `npm run lint:check` pass before opening a PR
4. Open a pull request with a clear description of the change and its motivation

---

> Built as part of the Rise Academy program.
