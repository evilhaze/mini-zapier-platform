# FlowForge — MVP Automation Platform (mini-Zapier)

Запуск за 2 дня: визуальный редактор workflow, триггеры, действия, очередь задач, логи и Dashboard.

## Требования

- **Node.js** 18+
- **Redis** (для очереди BullMQ)

## Установка и запуск

### 1. Установка зависимостей

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Redis

Убедитесь, что Redis запущен (по умолчанию `localhost:6379`). Пример с Docker:

```bash
docker run -d -p 6379:6379 redis:alpine
```

Опционально задайте переменные в `.env` в папке `backend`:

```
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
DB_PATH=./data/workflows.db
```

### 3. Инициализация БД

```bash
cd backend && npm run db:init
```

Папка `backend/data` создаётся при первом запуске (или создайте вручную).

### 4. Запуск в dev

Из корня проекта:

```bash
npm run dev
```

- Backend: http://localhost:3001  
- Frontend: http://localhost:5173 (проксирует `/api` на бэкенд)  
- Swagger: http://localhost:3001/api-docs  

Либо по отдельности:

```bash
# Терминал 1
cd backend && npm run dev

# Терминал 2
cd frontend && npm run dev
```

## Функциональность MVP

- **Визуальный редактор** — drag-and-drop узлов, связи между ними (в духе Make / Node-RED).
- **Триггеры:** Webhook, Schedule (cron), Email (заглушка).
- **Действия:** HTTP request, Email, Telegram, DB (заглушка), Data transformation.
- **Логирование** — каждый шаг выполнения пишется в `execution_steps` (input/output/error).
- **Ошибки:** retry через BullMQ (3 попытки, exponential backoff), при падении — статус `failed` и запись в execution.
- **Dashboard** — список workflows, статистика (total/success/failed), история запусков и детальный просмотр логов по запуску.

## API

- `GET/POST /api/workflows` — список и создание.
- `GET/PUT/DELETE /api/workflows/:id` — один workflow.
- `POST /api/workflows/:id/run` — ручной запуск.
- `GET /api/executions`, `GET /api/executions/stats`, `GET /api/executions/:id`, `GET /api/executions/:id/steps` — история и логи.
- `POST /api/webhooks/:workflowId` — вызов workflow по webhook.

Документация: **http://localhost:3001/api-docs** (Swagger).

## Структура

- `backend/` — Express, BullMQ, SQLite, движок выполнения (triggers + actions).
- `frontend/` — React, Vite, React Flow, Tailwind; страницы Dashboard, Editor, Executions.
