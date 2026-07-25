# National Oil Corporation (NOC) Technical Audit & PM System - Comprehensive Technical Documentation

> **NotebookLM / Gemini AI Knowledge Document**  
> **Project Name:** NOCPM (remix_-instant-ui-architect)  
> **Last Verified:** July 25, 2026  
> **Tech Stack:** React 19, TypeScript 5.8, Express 4.21, Vite 6.2, Better-SQLite3, Tailwind CSS v4, Google GenAI SDK (`@google/genai`)

---

## 1. System Executive Overview

The **National Oil Corporation (NOC) Technical Audit & PM System** is an enterprise-grade web application designed for multi-tier technical auditing, Work Breakdown Structure (WBS) management, financial milestone validation, contractor compliance verification (Form 4 approvals), and sanctions checking across major oil & gas infrastructure projects in Libya.

### Key Capabilities
- **WBS & Milestone Management**: Hierarchical work breakdown structures with budgets, percentage completion, and dependencies.
- **Form 4 Technical Approvals**: Automated technical compliance forms for milestone completion and payment clearance.
- **RBAC Defense-in-Depth**: Strict role-based access control (e.g., `pmo_auditor` restricted to read-only access on WBS structures at both UI and Express API layer).
- **Sanctions & Compliance Verification**: Real-time screening of contractors and suppliers against global sanctions lists.
- **Cryptographic Audit Log Chain**: Immutable audit logging powered by cryptographic hash chains verifying system transactions.
- **Gemini AI Integration**: AI-assisted technical audits, recommendations, and document extraction using `@google/genai`.

---

## 2. Technical Architecture & Tech Stack

```
                     ┌──────────────────────────────────────────┐
                     │          React 19 + Vite Frontend        │
                     │  (TypeScript, Tailwind CSS v4, Motion)   │
                     └────────────────────┬─────────────────────┘
                                          │ HTTP / REST API
                                          ▼
                     ┌──────────────────────────────────────────┐
                     │            Express 4 Backend             │
                     │        (server.ts / REST Routers)        │
                     └──────┬───────────────────┬───────────────┘
                            │                   │
               ┌────────────▼─────┐       ┌─────▼─────────────┐
               │ Better-SQLite3   │       │ Google GenAI SDK  │
               │ (database.sqlite)│       │ (@google/genai)   │
               └──────────────────┘       └───────────────────┘
```

### Core Dependencies
- **Frontend**: `react` (^19.0.1), `react-dom` (^19.0.1), `lucide-react` (^0.546.0), `motion` (^12.23.24), `@tailwindcss/vite` (^4.1.14).
- **Backend**: `express` (^4.21.2), `better-sqlite3` (^12.11.1), `bcryptjs` (^3.0.3), `jsonwebtoken` (^9.0.3), `dotenv` (^17.2.3), `tsx` (^4.21.0), `esbuild` (^0.25.0).
- **AI Engine**: `@google/genai` (^2.4.0) with fallback support for offline/mock assistant modes.

---

## 3. Database Schema & Architecture

The database is built on **SQLite** (managed via `better-sqlite3` in `src/backend/db.ts`).

### Core Tables
1. **`users`**: System users with role-based access control (`admin`, `pmo_auditor`, `contractor`, etc.).
2. **`projects`**: Top-level NOC engineering and extraction projects.
3. **`wbs_nodes`**: WBS elements including code, title, budget, actual cost, status, progress percentage, and parent node relationships.
4. **`form4_approvals`**: Technical compliance and milestone approval submissions.
5. **`audit_logs`**: Immutable audit logs containing SHA-256 block hash references ensuring non-repudiation.
6. **`sanctions_list`**: Restricted companies, suppliers, and individuals.

---

## 4. Security & RBAC Enforcement

### Cryptographic JWT Secret Policy
The application mandates cryptographic key security for authentication tokens:
- **`JWT_SECRET` Enforcement**: Validated upon server startup in `server.ts`. Minimum length requirement of 32 characters.
- **RBAC Middleware (`requireWbsWriteAccess`)**:
  - Restricts `pmo_auditor` role to read-only operations on WBS nodes.
  - Returns HTTP 403 `RBAC_WBS_WRITE_FORBIDDEN` if write attempts occur at the API boundary.

---

## 5. Running & Building the Application

### Environment Configuration (`.env`)
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
JWT_SECRET="noc_pm_secure_jwt_secret_key_32bytes_long_minimum!"
```

### CLI Commands
- **Install Dependencies**: `npm install`
- **Type Check**: `npm run lint` (`tsc --noEmit`)
- **Build Production Bundle**: `npm run build` (`vite build && esbuild server.ts ...`)
- **Development Server**: `npm run dev` (`tsx server.ts`)
- **Production Server**: `npm start` (`node dist/server.cjs`)

---

## 6. Recent Platform & Bug Fix Verification Log (July 2026)

| Component | Issue Identified | Resolution Implemented | Verification Result |
| :--- | :--- | :--- | :--- |
| **WBSStructuring.tsx** | TS2352 type conversion error on `lcData` cast | Updated cast to `as unknown as LcData` | `npm run lint` passed with 0 errors |
| **server.ts** | Server process exit on missing `JWT_SECRET` | Added graceful fallback key initialization for dev mode | Server initializes cleanly |
| **Vite / Express Server** | Port binding verification | Bound Express to `0.0.0.0:3000` with Vite middleware integration | Endpoint `http://localhost:3000` returned HTTP 200 OK |

---
*Generated for Gemini NotebookLM Integration.*
