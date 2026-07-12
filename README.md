# TransitOps — Smart Transport Operations Platform

TransitOps is a centralized platform for managing the full lifecycle of transport operations —
vehicle registration, driver management, trip dispatching, maintenance, fuel & expense tracking,
and operational analytics — with role-based access control enforced end to end.

Built for an 8-hour hackathon brief; digitizes what most logistics teams still run on spreadsheets
and logbooks, while enforcing the business rules that spreadsheets can't (capacity checks, license
expiry, duplicate assignment prevention, automatic status transitions).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Roles & Access](#roles--access)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Overview](#api-overview)
- [Core Business Rules](#core-business-rules)
- [Scripts](#scripts)
- [Testing](#testing)
- [Deliverables Checklist](#deliverables-checklist)
- [Documentation](#documentation)

---

## Features

**Core (mandatory):**
- Secure authentication (JWT access + refresh tokens) with account lockout after 5 failed attempts
- Role-Based Access Control for **Fleet Manager**, **Driver**, **Safety Officer**, **Financial Analyst**
- Dashboard with live KPIs (active/available vehicles, active/pending trips, drivers on duty, fleet utilization %)
- Full CRUD for the Vehicle Registry and Driver profiles, with unique registration/license enforcement
- Trip lifecycle management: `Draft → Dispatched → Completed / Cancelled`, with automatic vehicle/driver status transitions
- Maintenance workflow that automatically pulls a vehicle out of the dispatch pool while it's in the shop
- Fuel log and expense tracking with auto-computed operational cost
- Reports & Analytics: fuel efficiency, fleet utilization, operational cost, vehicle ROI
- CSV export
- Responsive dark-themed UI matching the platform mockup

**Bonus:**
- PDF export
- Email reminders for expiring driver licenses / vehicle documents
- Vehicle document management (RC book, insurance, permit, PUC — with expiry tracking)
- Additional charts: fleet status breakdown, fuel efficiency trend, driver safety score distribution
- **Editable RBAC** — Fleet Manager can change what other roles can access, per module, directly from Settings

---

## Tech Stack

**Frontend:** Next.js 15 (App Router) · React 18 · TypeScript · Tailwind CSS · shadcn/ui · Zustand · React Query · React Hook Form + Zod · Recharts

**Backend:** Node.js · Express.js · TypeScript · PostgreSQL · Prisma ORM · JWT · bcrypt · Zod · node-cron · nodemailer · multer

---

## Roles & Access

One login, four roles — access is scoped automatically after sign-in.

| Role | Description |
|---|---|
| **Fleet Manager** | Full system access — fleet assets, maintenance, vehicle lifecycle, settings, RBAC control |
| **Driver** | Creates trips, assigns vehicles and drivers, monitors active deliveries |
| **Safety Officer** | Driver compliance, license validity, safety scores, maintenance |
| **Financial Analyst** | Operational expenses, fuel consumption, maintenance costs, profitability, exports |

The default permission matrix lives in [`docs/00-master-plan.md`](docs/00-master-plan.md#4-roles--permission-matrix)
but is **editable at runtime** — a Fleet Manager can grant or revoke another role's access to any
module from the Settings screen. The backend is the source of truth; the frontend nav mirrors it.

---

## Project Structure

```
transitops/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/       # authenticate, authorize, errorHandler, validate
│   │   ├── modules/          # auth, vehicles, drivers, trips, maintenance,
│   │   │                     # fuel, expenses, analytics, users, permissions,
│   │   │                     # documents, reminders
│   │   ├── utils/            # tokens, hash, statusMachine
│   │   ├── app.ts
│   │   └── server.ts
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── (auth)/login/
│   │   └── (dashboard)/      # dashboard, fleet, drivers, trips, maintenance,
│   │                         # fuel-expenses, analytics, settings
│   ├── components/
│   │   ├── ui/                # shadcn primitives
│   │   ├── layout/             # Sidebar, Topbar
│   │   ├── shared/              # DataTable, StatCard, StatusBadge, FilterBar...
│   │   └── modules/             # feature-specific components
│   ├── lib/                   # api client, auth store, rbac
│   └── middleware.ts          # route guard
└── docs/                      # full spec package (see below)
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm

### 1. Clone and install
```bash
git clone <repo-url> transitops
cd transitops
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Fill in `DATABASE_URL`, JWT secrets, and (optionally) SMTP credentials — see
[Environment Variables](#environment-variables).

### 3. Set up the database
```bash
cd backend
npx prisma migrate dev
npm run db:seed
```
Seeded accounts (one per role) are created by the seed script — check `prisma/seed.ts` for the exact
demo credentials.

### 4. Run the apps
```bash
# from backend/
npm run dev        # http://localhost:4000

# from frontend/, in a separate terminal
npm run dev         # http://localhost:3000
```

Visit `http://localhost:3000/login` and sign in with any of the seeded role accounts.

---

## Environment Variables

**backend/.env**
```
DATABASE_URL=postgresql://user:password@localhost:5432/transitops
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
PORT=4000
CORS_ORIGIN=http://localhost:3000

# SMTP (for expiring-license email reminders — optional but required for that feature)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

**frontend/.env**
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Database

Eight core entities plus supporting models for editable RBAC, document management, and reminder
tracking: `User`, `Vehicle`, `Driver`, `Trip`, `MaintenanceLog`, `FuelLog`, `Expense`,
`RolePermission`, `VehicleDocument`, `ReminderLog`, `AuditLog`.

Full schema: [`docs/01-schema.prisma`](docs/01-schema.prisma) — copy directly into
`backend/prisma/schema.prisma`.

Key status state machines:
- **Vehicle:** `Available ⇄ On Trip` · `Available ⇄ In Shop` · `→ Retired` (terminal)
- **Driver:** `Available ⇄ On Trip` · `Available ⇄ Off Duty` · `→ Suspended`
- **Trip:** `Draft → Dispatched → Completed` · `Draft/Dispatched → Cancelled`

All transitions are enforced server-side inside Prisma transactions — never trusted from client input.

---

## API Overview

Base URL: `/api`. JWT access token in `Authorization: Bearer <token>`, refresh token in an httpOnly
cookie. Every protected route runs authentication, then authorization against the live permission
matrix.

| Module | Base Route |
|---|---|
| Auth | `/api/auth` |
| Vehicles | `/api/vehicles` |
| Drivers | `/api/drivers` |
| Trips | `/api/trips` |
| Maintenance | `/api/maintenance` |
| Fuel Logs | `/api/fuel` |
| Expenses | `/api/expenses` |
| Analytics (+ CSV/PDF export) | `/api/analytics` |
| Users / Permissions | `/api/users`, `/api/permissions` |
| Vehicle Documents | `/api/vehicles/:id/documents` |
| Reminders | `/api/reminders` |

Full endpoint-by-endpoint spec, payloads, and required roles:
[`docs/02-api-specification.md`](docs/02-api-specification.md).

---

## Core Business Rules

A few of the rules enforced server-side (full list in
[`docs/03-business-rules.md`](docs/03-business-rules.md)):

- Cargo weight can never exceed the assigned vehicle's max load capacity
- Retired or In Shop vehicles never appear in dispatch selection
- Drivers with expired licenses or `Suspended` status can't be assigned to trips
- A vehicle or driver already `On Trip` can't be assigned to another trip
- Dispatching a trip flips both vehicle and driver to `On Trip`; completing or cancelling flips them back
- Opening a maintenance record flips the vehicle to `In Shop` and pulls it from the dispatch pool
- Trip completion requires final odometer + fuel consumed, per the standard workflow
- `Vehicle ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost`
- Every mutating route checks role/permission server-side — the UI hiding a control is never the
  actual security boundary

---

## Scripts

**backend/**
| Script | Purpose |
|---|---|
| `npm run dev` | Start the API in watch mode |
| `npm run build` | Compile TypeScript |
| `npm run db:seed` | Seed demo data |
| `npx prisma studio` | Inspect the database visually |
| `npx prisma migrate dev` | Run migrations |

**frontend/**
| Script | Purpose |
|---|---|
| `npm run dev` | Start Next.js in dev mode |
| `npm run build` | Production build |
| `npm run lint` | Lint |

---

## Testing

- Backend: unit tests for every business rule, integration tests (supertest) for the full trip
  lifecycle and auth flows
- Frontend: component tests for shared UI, Playwright e2e smoke test covering login-per-role and a
  full trip lifecycle

---

## Deliverables Checklist

- [x] Responsive dark-themed UI
- [x] JWT auth with RBAC (editable by Fleet Manager)
- [x] Full CRUD — Vehicles, Drivers
- [x] Trip management with validations
- [x] Automatic status transitions
- [x] Maintenance workflow
- [x] Fuel & expense tracking
- [x] KPI dashboard
- [x] Charts & visual analytics
- [x] CSV export
- [x] PDF export
- [x] Email reminders for expiring licenses
- [x] Vehicle document management
- [x] Search, filters, sorting

---

## Documentation

The full spec package this project was built from lives in `/docs`:

| File | Contents |
|---|---|
| `00-master-plan.md` | Architecture, stack, folder structure, RBAC matrix, build order |
| `01-schema.prisma` | Complete Prisma schema |
| `02-api-specification.md` | Every endpoint, payload, and required role |
| `03-business-rules.md` | All validation logic, written testably |
| `04-frontend-spec.md` | Screen-by-screen UI spec mapped to the mockup |
| `05-antigravity-build-prompts.md` | The prompts this project was generated from, module by module |

---

## License

Internal hackathon project — license terms as decided by the project owner.
