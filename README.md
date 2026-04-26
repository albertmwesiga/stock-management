# FleetStock — Fleet Stock, Fuel & Sales Management System

A production-ready monorepo for managing fleet operations including vehicle journeys, fuel tracking, stock inventory, sales collections, allowances, and real-time director oversight.

---

## System Overview

FleetStock provides a role-based management platform for fish/commodity transport fleets:

- **Directors** get a real-time Socket.IO dashboard with live KPIs
- **Drivers** log journeys, fuel refills, service records, and mechanical issues
- **Stock Managers** receive and release stock inventory
- **Sales Managers** record cash collections and submit end-of-day reports

---

## Prerequisites

- **Node.js** 18+
- **npm** 9+
- **PostgreSQL** 14+

---

## Architecture

```
stock-management/
├── apps/
│   ├── api/          NestJS REST API (port 3001)
│   └── web/          Next.js 14 App Router (port 3000)
├── packages/
│   └── db/           Prisma schema + migrations + seed
├── package.json      Turborepo monorepo root
├── turbo.json
└── .env.example
```

### Text Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (port 3000)                  │
│                  Next.js 14 (App Router)                 │
│     ┌─────────┬──────────┬───────────┬────────────┐     │
│     │ /driver │  /stock  │   /sales  │ /director  │     │
│     └────┬────┴────┬─────┴─────┬─────┴─────┬──────┘     │
│          │  REST   │   REST    │   REST    │ Socket.IO   │
└──────────┼─────────┼───────────┼───────────┼─────────────┘
           │         │           │           │
┌──────────▼─────────▼───────────▼───────────▼─────────────┐
│                  NestJS API (port 3001)                   │
│  ┌──────┬───────┬────────┬─────────┬──────────────────┐  │
│  │ auth │ users │journeys│  fuel   │ stock / sales    │  │
│  │      │vehicles│ stops │         │ allowances/audit │  │
│  └──────┴───────┴────────┴─────────┴──────────────────┘  │
│                     Socket.IO Gateway                     │
└────────────────────────────┬──────────────────────────────┘
                             │ Prisma ORM
                    ┌────────▼───────┐
                    │  PostgreSQL DB  │
                    └────────────────┘
```

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone <repo-url>
cd stock-management
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/stockmanagement
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=24h
PORT=3001
CURRENCY=UGX
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

Also create `apps/api/.env` and `apps/web/.env.local` with the same values.

### 3. Database Setup

```bash
# Create database
createdb stockmanagement

# Generate Prisma client & push schema
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Run Development

```bash
npm run dev
```

This starts:
- **API** at http://localhost:3001
- **Web** at http://localhost:3000
- **Swagger Docs** at http://localhost:3001/api/docs

---

## Default Demo Users

| Role | Email | Password | Redirect |
|------|-------|----------|----------|
| Director | director@fleet.com | password123 | /director/dashboard |
| Driver | driver@fleet.com | password123 | /driver/journey |
| Stock Manager | stock@fleet.com | password123 | /stock/receive |
| Sales Manager | sales@fleet.com | password123 | /sales/collections |

---

## API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Login, returns JWT |

### Users (Director only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users | List all users |
| POST | /users | Create user |
| PUT | /users/:id | Update user |
| DELETE | /users/:id | Delete user |

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /vehicles | List vehicles |
| POST | /vehicles | Create vehicle (Director) |
| PUT | /vehicles/:id | Update vehicle (Director) |
| DELETE | /vehicles/:id | Delete vehicle (Director) |

### Journeys (Driver)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /journeys | List journeys |
| GET | /journeys/active | Get active journeys |
| POST | /journeys/start | Start journey |
| POST | /journeys/:id/stop | Complete journey |
| POST | /journeys/:id/stops | Add a stop |
| GET | /journeys/:id/stops | List stops |

### Fuel
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /fuel/refills | List refills |
| POST | /fuel/refills | Log refill (Driver) |

### Stock
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /stock/types | List stock types |
| POST | /stock/types | Create type |
| GET | /stock/entries | List entries |
| POST | /stock/entries | Create entry (Stock Manager) |
| GET | /stock/summary | Balance by stock type |

### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /sales/records | List sale records |
| POST | /sales/records | Create record (Sales Manager) |
| GET | /sales/summary | Daily summary |

### Allowances
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /allowances | List (filtered by role) |
| POST | /allowances/request | Submit request |
| PUT | /allowances/:id/approve | Approve (Director) |
| PUT | /allowances/:id/reject | Reject (Director) |
| PUT | /allowances/:id/payout | Mark paid (Director) |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /reports/end-of-day/:vehicleId/:date | Daily vehicle report |
| POST | /reports/end-of-day | Submit EOD report |
| GET | /reports/director/live-summary | Live dashboard snapshot |
| GET | /reports/mileage | Mileage by vehicle |

### Mechanical & Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /mechanical/issues | List issues |
| POST | /mechanical/issues | Report issue |
| PUT | /mechanical/issues/:id/resolve | Resolve issue |
| GET | /service/records | List service records |
| POST | /service/records | Log service |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | — |
| JWT_SECRET | JWT signing secret | — |
| JWT_EXPIRY | Token expiry | 24h |
| PORT | API port | 3001 |
| CURRENCY | Currency code | UGX |
| NEXT_PUBLIC_API_URL | API URL for browser | http://localhost:3001 |
| NEXT_PUBLIC_SOCKET_URL | Socket.IO URL | http://localhost:3001 |

---

## Real-Time Events (Socket.IO)

The director dashboard subscribes to these events:

| Event | Trigger |
|-------|---------|
| `journey:started` | Driver starts a journey |
| `journey:completed` | Driver ends a journey |
| `journey:stop_added` | Driver adds a journey stop |
| `fuel:refill` | Driver logs a fuel refill |
| `stock:update` | Stock entry created |
| `sales:record` | Sales record created |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + npm workspaces |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | NestJS 10, TypeScript |
| Database | PostgreSQL 14 + Prisma ORM |
| Auth | JWT (passport-jwt) + bcrypt |
| Real-time | Socket.IO |
| API Docs | Swagger (OpenAPI 3) |

---

## Building for Production

```bash
# Build all packages
npm run build

# Start API
cd apps/api && node dist/main

# Start web
cd apps/web && npm start
```

---

## Database Commands

```bash
npm run db:push       # Push schema to DB (no migration history)
npm run db:migrate    # Create migration
npm run db:seed       # Seed demo data
npm run db:studio     # Open Prisma Studio GUI
```
