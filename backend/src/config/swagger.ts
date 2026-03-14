import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Automation Platform API',
      version: '0.1.0',
      description: `
MVP automation platform (mini-Zapier). Workflows are defined as nodes + edges.
Triggers: **webhook** (POST this API), **schedule** (cron), **email** (defined in workflow; no HTTP endpoint in MVP).
Actions: HTTP, Email, Telegram, DB, Transform.
Executions are queued (BullMQ) and run asynchronously; use GET /executions to inspect status and steps.
      `.trim(),
    },
    servers: [{ url: '/api', description: 'API base' }],
    tags: [
      { name: 'Health', description: 'Liveness and readiness' },
      { name: 'Workflows', description: 'Workflow CRUD, run, pause/resume' },
      { name: 'Executions', description: 'Execution history and details' },
      { name: 'Statistics', description: 'Dashboard aggregates' },
      { name: 'Triggers', description: 'Webhook and trigger endpoints' },
    ],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          description: 'Returns 200 if the service is up. Use for load balancer or readiness probes.',
          tags: ['Health'],
          responses: {
            200: {
              description: 'Service is running',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/HealthResponse' },
                  example: { ok: true, timestamp: '2025-03-14T12:00:00.000Z' },
                },
              },
            },
          },
        },
      },
      '/workflows': {
        get: {
          summary: 'List all workflows',
          description: 'Returns workflows ordered by updatedAt descending. No pagination in MVP.',
          tags: ['Workflows'],
          responses: {
            200: {
              description: 'List of workflows',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Workflow' } },
                  example: [
                    {
                      id: '550e8400-e29b-41d4-a716-446655440000',
                      name: 'Order to Slack',
                      status: 'active',
                      isPaused: false,
                      definitionJson: { nodes: [], edges: [] },
                      createdAt: '2025-03-14T10:00:00.000Z',
                      updatedAt: '2025-03-14T11:00:00.000Z',
                    },
                  ],
                },
              },
            },
          },
        },
        post: {
          summary: 'Create workflow',
          description: 'Creates a new workflow. If definition contains a schedule trigger with cron, it will be registered automatically.',
          tags: ['Workflows'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/WorkflowCreate' },
                example: {
                  name: 'My workflow',
                  status: 'draft',
                  isPaused: false,
                  definitionJson: {
                    nodes: [
                      { id: 't1', type: 'webhook', config: {} },
                      { id: 'a1', type: 'http', config: { url: 'https://api.example.com' } },
                    ],
                    edges: [{ source: 't1', target: 'a1' }],
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Workflow created',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Workflow' } } },
            },
            400: {
              description: 'Validation error (e.g. missing name or definitionJson)',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
      },
      '/workflows/{id}': {
        get: {
          summary: 'Get workflow by id',
          tags: ['Workflows'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'Workflow found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Workflow' } } },
            },
            400: { description: 'Invalid UUID', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Workflow not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          summary: 'Update workflow',
          description: 'Partial update. Schedule trigger is re-registered if definition or isPaused changes.',
          tags: ['Workflows'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/WorkflowUpdate' },
                example: { name: 'Updated name', status: 'active' },
              },
            },
          },
          responses: {
            200: {
              description: 'Workflow updated',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Workflow' } } },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Workflow not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          summary: 'Delete workflow',
          description: 'Permanently deletes the workflow, its executions and steps. Schedule trigger is unregistered.',
          tags: ['Workflows'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            204: { description: 'Workflow deleted' },
            400: { description: 'Invalid UUID', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Workflow not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/workflows/{id}/pause': {
        post: {
          summary: 'Pause workflow',
          description: 'Sets isPaused to true. Schedule trigger is stopped; webhook and run requests will be rejected (423/queue skip) while paused.',
          tags: ['Workflows'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'Workflow paused',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Workflow' } } },
            },
            400: { description: 'Invalid UUID', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Workflow not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/workflows/{id}/resume': {
        post: {
          summary: 'Resume workflow',
          description: 'Sets isPaused to false. If the workflow has a schedule trigger, it is re-registered.',
          tags: ['Workflows'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'Workflow resumed',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Workflow' } } },
            },
            400: { description: 'Invalid UUID', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Workflow not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/workflows/{id}/run': {
        post: {
          summary: 'Run workflow manually',
          description: 'Creates a pending Execution, enqueues a job to BullMQ. Execution runs asynchronously; poll GET /executions/:id for status and steps.',
          tags: ['Workflows'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RunWorkflowRequest' },
                example: { inputPayload: { source: 'manual' } },
              },
            },
          },
          responses: {
            202: {
              description: 'Execution queued. Use executionId to fetch GET /executions/:id.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RunWorkflowResponse' },
                  example: { executionId: '550e8400-e29b-41d4-a716-446655440001', status: 'queued' },
                },
              },
            },
            400: { description: 'Invalid id or request body', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Workflow not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            503: { description: 'Queue unavailable (e.g. Redis down)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/workflows/{id}/executions': {
        get: {
          summary: 'List executions for a workflow',
          description: 'Paginated list of executions for the given workflow. Filter by status, page, limit.',
          tags: ['Workflows', 'Executions'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Workflow ID' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'running', 'success', 'failed', 'paused'] }, description: 'Filter by execution status' },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          ],
          responses: {
            200: {
              description: 'Paginated list of executions',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ExecutionListResult' }, example: { data: [], total: 0, page: 1, limit: 20 } } },
            },
            400: { description: 'Validation error (e.g. invalid UUID)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/executions': {
        get: {
          summary: 'List executions',
          description: 'Paginated list with optional filters. Use workflowId to restrict to one workflow; status for pending|running|success|failed|paused.',
          tags: ['Executions'],
          parameters: [
            { name: 'workflowId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filter by workflow' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'running', 'success', 'failed', 'paused'] }, description: 'Filter by status' },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 }, description: 'Page number (default 1)' },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 }, description: 'Items per page (default 20)' },
          ],
          responses: {
            200: {
              description: 'Paginated list',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ExecutionListResult' } } },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/executions/{id}': {
        get: {
          summary: 'Get execution details',
          description: 'Returns execution with steps (ordered by startedAt) and workflow basic info (id, name, status, isPaused). Use for run logs and debugging.',
          tags: ['Executions'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'Execution with steps and workflow',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ExecutionDetail' } } },
            },
            400: { description: 'Invalid UUID', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Execution not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/statistics/overview': {
        get: {
          summary: 'Dashboard overview statistics',
          description: 'Aggregate counts for dashboard: workflows (total, active, paused), executions (total, success, failed, paused), success rate, and recent executions (last 24h).',
          tags: ['Statistics'],
          responses: {
            200: {
              description: 'Overview stats',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/StatisticsOverview' },
                  example: {
                    totalWorkflows: 5,
                    activeWorkflows: 3,
                    pausedWorkflows: 1,
                    totalExecutions: 120,
                    successfulExecutions: 110,
                    failedExecutions: 8,
                    pausedExecutions: 2,
                    successRate: 0.92,
                    recentExecutionsCount: 15,
                  },
                },
              },
            },
          },
        },
      },
      '/triggers/webhook/{workflowId}': {
        post: {
          summary: 'Webhook trigger',
          description: 'Trigger a workflow by HTTP. Request body is stored as execution inputPayload and passed to the workflow. Use this URL as the webhook endpoint for external services (e.g. Stripe, GitHub). If workflow is paused, returns 423.',
          tags: ['Triggers'],
          parameters: [
            { name: 'workflowId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Workflow ID (from GET /workflows)' },
          ],
          requestBody: {
            description: 'Any JSON payload. Stored as execution inputPayload.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/WebhookPayload' },
                example: {
                  event: 'order.created',
                  timestamp: '2025-03-14T12:00:00Z',
                  data: { id: 'ord_123', amount: 99.99 },
                },
              },
            },
          },
          responses: {
            202: {
              description: 'Execution accepted and queued',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/WebhookTriggerResponse' },
                  example: { executionId: '550e8400-e29b-41d4-a716-446655440002', status: 'queued' },
                },
              },
            },
            400: { description: 'Invalid workflow id (e.g. not a UUID)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Workflow not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            423: { description: 'Workflow is paused; trigger rejected', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { error: 'Workflow is paused' } } } },
            503: { description: 'Queue unavailable (e.g. Redis down)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
    },
    components: {
      schemas: {
        ErrorResponse: {
          type: 'object',
          description: 'Error payload for 4xx/5xx responses',
          properties: {
            error: { type: 'string', description: 'Error message' },
            details: { type: 'object', description: 'Optional validation details (e.g. field errors)' },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        Workflow: {
          type: 'object',
          description: 'Workflow entity. status: draft | active | archived. isPaused: schedule and webhook are disabled when true.',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'active', 'archived'] },
            isPaused: { type: 'boolean' },
            definitionJson: { type: 'object', description: 'Graph: nodes (id, type, config, name) and edges (source, target)' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        WorkflowCreate: {
          type: 'object',
          required: ['name', 'definitionJson'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
            status: { type: 'string', enum: ['draft', 'active', 'archived'], default: 'draft' },
            isPaused: { type: 'boolean', default: false },
            definitionJson: { type: 'object', description: 'nodes array + edges array' },
          },
        },
        WorkflowUpdate: {
          type: 'object',
          description: 'Partial update; all fields optional',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
            status: { type: 'string', enum: ['draft', 'active', 'archived'] },
            isPaused: { type: 'boolean' },
            definitionJson: { type: 'object' },
          },
        },
        RunWorkflowRequest: {
          type: 'object',
          properties: {
            inputPayload: { type: 'object', description: 'Optional JSON passed as trigger input to the workflow' },
          },
        },
        RunWorkflowResponse: {
          type: 'object',
          required: ['executionId', 'status'],
          properties: {
            executionId: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['queued'] },
          },
        },
        Execution: {
          type: 'object',
          description: 'Execution status: pending (queued) | running | success | failed | paused.',
          properties: {
            id: { type: 'string', format: 'uuid' },
            workflowId: { type: 'string', format: 'uuid' },
            triggerType: { type: 'string', enum: ['manual', 'webhook', 'schedule', 'email'] },
            status: { type: 'string', enum: ['pending', 'running', 'success', 'failed', 'paused'] },
            inputPayload: { type: 'object', nullable: true },
            outputPayload: { type: 'object', nullable: true },
            errorMessage: { type: 'string', nullable: true },
            startedAt: { type: 'string', format: 'date-time' },
            finishedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ExecutionStep: {
          type: 'object',
          description: 'One step (action node) in an execution. status: running | success | failed.',
          properties: {
            id: { type: 'string', format: 'uuid' },
            executionId: { type: 'string', format: 'uuid' },
            nodeId: { type: 'string' },
            nodeName: { type: 'string', nullable: true },
            nodeType: { type: 'string', description: 'e.g. http, email, telegram, db, transform' },
            status: { type: 'string', enum: ['running', 'success', 'failed'] },
            inputData: { type: 'object', nullable: true },
            outputData: { type: 'object', nullable: true },
            errorMessage: { type: 'string', nullable: true },
            retryCount: { type: 'integer' },
            startedAt: { type: 'string', format: 'date-time' },
            finishedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        WorkflowBasic: {
          type: 'object',
          description: 'Embedded in ExecutionDetail',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            status: { type: 'string' },
            isPaused: { type: 'boolean' },
          },
        },
        ExecutionDetail: {
          type: 'object',
          description: 'Execution with steps array (ordered by startedAt) and workflow (basic info)',
          properties: {
            id: { type: 'string', format: 'uuid' },
            workflowId: { type: 'string', format: 'uuid' },
            triggerType: { type: 'string' },
            status: { type: 'string' },
            inputPayload: { type: 'object', nullable: true },
            outputPayload: { type: 'object', nullable: true },
            errorMessage: { type: 'string', nullable: true },
            startedAt: { type: 'string', format: 'date-time' },
            finishedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            steps: { type: 'array', items: { $ref: '#/components/schemas/ExecutionStep' } },
            workflow: { $ref: '#/components/schemas/WorkflowBasic' },
          },
        },
        ExecutionListResult: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/Execution' } },
            total: { type: 'integer', description: 'Total count matching filters' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
          },
        },
        StatisticsOverview: {
          type: 'object',
          description: 'Dashboard overview. successRate = successfulExecutions/totalExecutions (0–1). recentExecutionsCount = last 24h.',
          properties: {
            totalWorkflows: { type: 'integer' },
            activeWorkflows: { type: 'integer', description: 'status = active' },
            pausedWorkflows: { type: 'integer', description: 'isPaused = true' },
            totalExecutions: { type: 'integer' },
            successfulExecutions: { type: 'integer' },
            failedExecutions: { type: 'integer' },
            pausedExecutions: { type: 'integer' },
            successRate: { type: 'number', minimum: 0, maximum: 1 },
            recentExecutionsCount: { type: 'integer' },
          },
        },
        WebhookPayload: {
          type: 'object',
          description: 'Arbitrary JSON; stored as execution inputPayload',
          additionalProperties: true,
        },
        WebhookTriggerResponse: {
          type: 'object',
          required: ['executionId', 'status'],
          properties: {
            executionId: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['queued'] },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerSpec);
