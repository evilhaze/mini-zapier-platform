# Mini-Zapier Frontend (Next.js)

Next.js 15 + TypeScript + Tailwind. SaaS-style dashboard for workflows, executions, and editor placeholder.

## Scripts

- `npm run dev` — dev server (default port 3000)
- `npm run build` — production build
- `npm run start` — run production build

## Structure

```
src/
  app/                    # App Router
    layout.tsx            # Root layout (Sidebar + Topbar)
    page.tsx              # Redirects to /dashboard
    globals.css
    dashboard/page.tsx
    workflows/
      page.tsx            # List (cards + table)
      new/page.tsx
      [id]/page.tsx       # Detail
      [id]/executions/page.tsx
      [id]/run/page.tsx   # Trigger run → redirect to execution
    editor/[id]/page.tsx  # Canvas placeholder (wire to React Flow)
    executions/
      page.tsx
      [id]/page.tsx       # Execution detail + steps
  components/
    layout/
      Sidebar.tsx
      Topbar.tsx
    dashboard/
      StatisticsCards.tsx
    workflows/
      StatusBadge.tsx
      WorkflowCard.tsx
      WorkflowTable.tsx
    executions/
      ExecutionsTable.tsx
  lib/
    api.ts                # API_BASE + api()
```

## API

Set `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:3001/api`) or it defaults to `http://localhost:3001/api`.

## Backend

Run backend on port 3001. For dev, run both: `npm run dev` (frontend) and backend `npm run dev`; use frontend for UI and it will call the API.

## Troubleshooting: `next dev` / `next build` exit immediately (no error)

If the dev server or build exits right away with no message (on Windows you may see exit code `-1073741795` / ACCESS_VIOLATION), the cause is usually the **project path containing non-ASCII characters** (e.g. Cyrillic like «Работа»). Next.js/Node can crash when resolving such paths.

**Fix:** run the frontend from a path that uses only ASCII:

- **Option A – Directory junction (no copy):**  
  Open PowerShell **as Administrator** and run once:
  ```powershell
  New-Item -ItemType Junction -Path "D:\zapier-frontend" -Target "D:\Работа MST\Zapier\frontend"
  ```
  Then use that path for dev/build:
  ```powershell
  cd D:\zapier-frontend
  npm run dev
  ```
  (Adjust `Target` to your real frontend path.)

- **Option B – Move or clone the repo** to a path without special characters (e.g. `D:\work\Zapier`).
