# Mini-Zapier — Automation Platform MVP

A lightweight workflow automation platform with a visual editor, trigger-based runs, and execution logging. Build automations with drag-and-drop nodes (triggers + actions), run them manually or on a schedule, and inspect every step in a monitoring-style UI.

---

## Features

- **Visual workflow editor** — Canvas with drag-and-drop nodes and edges (Make / Node-RED style). Trigger and action nodes with inline configuration.
- **Triggers** — Webhook, Schedule (cron), Manual, Email (stub).
- **Actions** — HTTP request, Email, Telegram, Database (stub), Data transform.
- **Execution engine** — Async runs via BullMQ; step-by-step logging (input/output/error) per node; retries with backoff; final execution status and error message.
- **Dashboard** — Overview stats (workflows, executions, success rate, last 24h); quick links to workflows and executions.
- **Workflows list** — Search, status filter (all/active/draft/archived/paused); run, pause/resume, delete; table and mobile-friendly cards.
- **Workflow detail** — Name, status, trigger type, run count, success rate; Open editor, Run now, Pause/Resume, Delete; recent executions and link to full history.
- **Execution history** — List with filters (status, workflow); pagination / load more; workflow, trigger, status, started/finished, duration, link to details.
- **Execution detail** — Summary card, step timeline with status/duration/retries, error blocks, collapsible input/output payloads (trigger input, final output, per-step I/O).
- **API** — REST for workflows and executions; Swagger at `/api-docs`. Webhook endpoint to trigger workflows by ID.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                        │
│  Dashboard │ Workflows │ Workflow detail │ Editor │ Executions   │
│  React Flow canvas, Tailwind, Sonner toasts                      │
└───────────────────────────────┬─────────────────────────────────┘
                                 │ HTTP /api/*
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Express)                           │
│  REST API │ Swagger │ Workflow CRUD │ Execution list/detail      │
│  Run → enqueue job │ Pause/Resume │ Scheduler (cron)            │
└─────────────┬───────────────────────────────┬───────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────────┐
│  PostgreSQL (Prisma)  │     │  Redis (BullMQ)                  │
│  Workflows             │     │  Job queue for async execution  │
│  Executions + Steps     │     │  Worker runs workflow engine     │
└─────────────────────────┘     └─────────────────────────────────┘
```

- **Frontend:** Next.js 15 (App Router), React 18, React Flow (canvas), Tailwind CSS, Sonner (toasts). Server components for data; client components for editor, filters, actions.
- **Backend:** Express, Zod (validation), Prisma (PostgreSQL), BullMQ (Redis), node-cron (schedule triggers). Single worker process consumes run jobs and executes workflows step-by-step.
- **Data flow:** Editor saves `definitionJson` (nodes + edges). Run creates an Execution, enqueues a job; worker loads workflow, runs trigger then actions in order, writes ExecutionSteps and final status.

---

## Tech Stack

| Layer     | Stack |
|----------|--------|
| Frontend | Next.js 15, React 18, React Flow (@xyflow/react), Tailwind CSS, Lucide icons, Sonner |
| Backend  | Node.js, Express, Prisma, PostgreSQL, BullMQ, node-cron, Zod, Swagger (swagger-jsdoc, swagger-ui-express) |
| Queue    | Redis (BullMQ) |
| DB       | PostgreSQL (network DB, Prisma) |

---

## Prerequisites

- **Node.js** 18+
- **Redis** (for BullMQ job queue), e.g. `localhost:6379`

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd Zapier
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment

In `backend/` create a `.env` from the example:

```bash
cd backend
cp .env.example .env
```

Edit if needed (defaults below).

### 3. Database

```bash
cd backend
npx prisma generate
npx prisma db push
```

PostgreSQL database schema will be created/updated in the database specified by `DATABASE_URL`.

### 4. Redis

Ensure Redis is running (default `localhost:6379`). Example with Docker:

```bash
docker run -d -p 6379:6379 redis:alpine
```

### 5. Run

From repo root:

```bash
npm run dev
```

- **Backend:** http://localhost:3001  
- **Frontend:** http://localhost:3000  
- **Swagger:** http://localhost:3001/api-docs  

Or run separately:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Frontend expects the API at `http://localhost:3001/api` by default (override with `NEXT_PUBLIC_API_URL`).

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                    | Default        |
|----------------|--------------------------------|----------------|
| `NODE_ENV`     | Environment                    | `development`  |
| `PORT`         | HTTP server port               | `3001`         |
| `DATABASE_URL` | Prisma PostgreSQL URL          | `postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public`|
| `REDIS_HOST`   | Redis host for BullMQ          | `localhost`    |
| `REDIS_PORT`   | Redis port                     | `6379`         |
| `TELEGRAM_BOT_TOKEN` | Optional; for notifications | —          |

### Frontend

| Variable               | Description              | Default                      |
|------------------------|--------------------------|------------------------------|
| `NEXT_PUBLIC_API_URL`  | Backend API base URL     | `http://localhost:3001/api`  |

---

## API & Swagger

- **Base URL:** `http://localhost:3001/api`
- **Swagger UI:** http://localhost:3001/api-docs

Main groups:

- **Workflows** — `GET/POST /workflows`, `GET/PUT/DELETE /workflows/:id`, `POST /workflows/:id/run`, `POST /workflows/:id/pause`, `POST /workflows/:id/resume`, `GET /workflows/:id/executions`
- **Executions** — `GET /executions` (list with `workflowId`, `status`, `page`, `limit`), `GET /executions/:id`, `GET /executions/:id/steps`
- **Statistics** — `GET /statistics/overview` (dashboard stats)
- **Webhooks** — `POST /triggers/webhook/:workflowId` (trigger by webhook; full URL: `POST /api/triggers/webhook/:workflowId`)

---

## Demo Scenarios

1. **Manual run**  
   Create a workflow in the editor (e.g. Manual trigger → HTTP action). Save, then from Workflows or workflow detail click **Run now**. Open the new execution to see summary, steps, and input/output.

2. **Schedule**  
   Add a Schedule trigger (cron), e.g. every hour. Save and wait, or run manually; executions appear in **Execution history**. Filter by workflow to see only this workflow’s runs.

3. **Webhook**  
   Create a workflow with Webhook trigger. Call `POST /api/triggers/webhook/:workflowId` with optional body; execution is queued and processed. Check execution detail for trigger input and step logs.

4. **Pause / Resume**  
   From workflow detail or list, use **Pause** then **Resume**. Schedule (and future runs) respect pause; run history and stats remain available.

5. **Debug a failure**  
   In **Execution history** open a failed run. Use the summary, step timeline, error blocks, and expandable input/output panels to see where and why it failed.

---

## Known MVP Limitations

- **Email trigger** — Stub only; no real inbox polling.
- **Database action** — Stub; no real DB driver wired.
- **Auth** — No login; single-user / local use.
- **Webhook auth** — No signature verification; suitable for internal/demo only.
- **Scale** — Single worker; PostgreSQL and in-memory scheduler; not tuned for high throughput.
- **Editor** — No version history, no branching; one definition per workflow.
- **Notifications** — Optional Telegram hook exists; no in-app notifications.

---

## Why This Scope for a 2-Day MVP

- **Core value fast:** Visual editor + run + logs deliver the main “automation platform” experience (design → run → inspect) without auth or infra.
- **Proven stack:** Next.js + Express + Prisma + BullMQ + React Flow are well-documented and allow quick iteration and a clean API boundary.
- **PostgreSQL + Redis:** Minimal setup (run Postgres + Redis), easy to run locally and demo.
- **Real execution path:** Triggers, actions, queue, steps, and errors are implemented end-to-end so the product is demonstrable and extensible (e.g. add more actions or triggers later).
- **Polished UI:** Dashboard, list/detail pages, filters, toasts, and execution logs make the MVP feel like a real product and set the base for future features (auth, more nodes, webhook security).

---

## Project Structure

```
├── backend/                 # Express API + worker
│   ├── prisma/
│   │   └── schema.prisma    # Workflow, Execution, ExecutionStep, DataRecord
│   ├── src/
│   │   ├── app.ts           # Express app, CORS, routes, Swagger
│   │   ├── server.ts        # DB connect, scheduler, BullMQ worker, listen
│   │   ├── config/          # Port, Redis, Swagger spec
│   │   ├── controllers/    # workflow, execution, statistics, triggers
│   │   ├── services/        # workflow, execution, workflowRunner, scheduler, queue
│   │   ├── routes/          # /workflows, /executions, /statistics, /triggers
│   │   └── queue/           # BullMQ client and worker setup
│   └── .env.example
├── frontend/                # Next.js App Router
│   ├── src/
│   │   ├── app/             # dashboard, workflows, workflows/[id], editor, editor/[id], executions, executions/[id]
│   │   ├── components/      # layout, dashboard, workflows, executions, editor (canvas, nodes, Sidebar, SettingsPanel), ui
│   │   └── lib/             # api, workflows-api, executions-api
│   └── ...
├── package.json             # Root scripts: dev, build (concurrently backend + frontend)
└── README.md
```

---

## License

Private / internal use unless otherwise specified.
