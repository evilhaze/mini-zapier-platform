import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Automation Platform API',
      version: '0.1.0',
      description: 'MVP automation platform',
    },
    servers: [{ url: '/api', description: 'API' }],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          tags: ['Health'],
          responses: { 200: { description: 'OK' } },
        },
      },
      '/workflows': {
        get: {
          summary: 'List all workflows',
          tags: ['Workflows'],
          responses: {
            200: { description: 'List of workflows', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Workflow' } } } } },
          },
        },
        post: {
          summary: 'Create workflow',
          tags: ['Workflows'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/WorkflowCreate' },
              },
            },
          },
          responses: {
            201: { description: 'Workflow created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Workflow' } } } },
            400: { description: 'Validation error' },
          },
        },
      },
      '/workflows/{id}': {
        get: {
          summary: 'Get workflow by id',
          tags: ['Workflows'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Workflow found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Workflow' } } } },
            400: { description: 'Invalid id' },
            404: { description: 'Workflow not found' },
          },
        },
        put: {
          summary: 'Update workflow',
          tags: ['Workflows'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/WorkflowUpdate' } } },
          },
          responses: {
            200: { description: 'Workflow updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Workflow' } } } },
            400: { description: 'Validation error' },
            404: { description: 'Workflow not found' },
          },
        },
        delete: {
          summary: 'Delete workflow',
          tags: ['Workflows'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            204: { description: 'Workflow deleted' },
            400: { description: 'Invalid id' },
            404: { description: 'Workflow not found' },
          },
        },
      },
      '/workflows/{id}/run': {
        post: {
          summary: 'Run workflow manually',
          description: 'Creates a pending Execution, enqueues a job to BullMQ, returns executionId and status queued.',
          tags: ['Workflows'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    inputPayload: { type: 'object', description: 'Optional trigger input (JSON)' },
                  },
                },
              },
            },
          },
          responses: {
            202: {
              description: 'Execution queued',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['executionId', 'status'],
                    properties: {
                      executionId: { type: 'string', format: 'uuid' },
                      status: { type: 'string', example: 'queued' },
                    },
                  },
                },
              },
            },
            400: { description: 'Invalid id or request body' },
            404: { description: 'Workflow not found' },
            503: { description: 'Queue unavailable (e.g. Redis down)' },
          },
        },
      },
      '/statistics/overview': {
        get: {
          summary: 'Dashboard overview statistics',
          description: 'Aggregate counts for workflows, executions, success rate, and recent executions (last 24h).',
          tags: ['Statistics'],
          responses: {
            200: {
              description: 'Overview stats',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/StatisticsOverview' },
                },
              },
            },
          },
        },
      },
      '/executions': {
        get: {
          summary: 'List executions',
          description: 'Paginated list with optional filter by workflowId and status.',
          tags: ['Executions'],
          parameters: [
            { name: 'workflowId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filter by workflow' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'running', 'success', 'failed', 'paused'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 }, description: 'Page (default 1)' },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 }, description: 'Items per page (default 20)' },
          ],
          responses: {
            200: {
              description: 'Paginated list',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ExecutionListResult' } } },
            },
            400: { description: 'Validation error' },
          },
        },
      },
      '/executions/{id}': {
        get: {
          summary: 'Get execution details',
          description: 'Execution with steps and workflow basic info.',
          tags: ['Executions'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'Execution with steps and workflow',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ExecutionDetail' } } },
            },
            400: { description: 'Invalid id' },
            404: { description: 'Execution not found' },
          },
        },
      },
      '/workflows/{id}/executions': {
        get: {
          summary: 'List executions for a workflow',
          description: 'Paginated list of executions for the given workflow. Same as GET /executions?workflowId=:id.',
          tags: ['Workflows', 'Executions'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'running', 'success', 'failed', 'paused'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          ],
          responses: {
            200: {
              description: 'Paginated list',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ExecutionListResult' } } },
            },
            400: { description: 'Validation error' },
          },
        },
      },
      '/triggers/webhook/{workflowId}': {
        post: {
          summary: 'Webhook trigger',
          description: 'Trigger a workflow by webhook. Creates an Execution with the request body as inputPayload and enqueues it. Use this URL as the webhook endpoint for external services.',
          tags: ['Triggers'],
          parameters: [
            {
              name: 'workflowId',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Workflow ID (from GET /workflows)',
            },
          ],
          requestBody: {
            description: 'Any JSON payload. Stored as execution inputPayload and passed to the workflow.',
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
                },
              },
            },
            400: { description: 'Invalid workflow id' },
            404: { description: 'Workflow not found' },
            423: { description: 'Workflow is paused' },
            503: { description: 'Queue unavailable' },
          },
        },
      },
    },
    components: {
      schemas: {
        Workflow: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'active', 'archived'] },
            isPaused: { type: 'boolean' },
            definitionJson: { type: 'object', description: 'nodes + edges' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        WorkflowCreate: {
          type: 'object',
          required: ['name', 'definitionJson'],
          properties: {
            name: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'active', 'archived'] },
            isPaused: { type: 'boolean' },
            definitionJson: { type: 'object', description: 'nodes + edges' },
          },
        },
        WorkflowUpdate: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'active', 'archived'] },
            isPaused: { type: 'boolean' },
            definitionJson: { type: 'object' },
          },
        },
        StatisticsOverview: {
          type: 'object',
          description: 'Dashboard overview statistics',
          properties: {
            totalWorkflows: { type: 'integer' },
            activeWorkflows: { type: 'integer', description: 'Workflows with status active' },
            pausedWorkflows: { type: 'integer', description: 'Workflows with isPaused true' },
            totalExecutions: { type: 'integer' },
            successfulExecutions: { type: 'integer' },
            failedExecutions: { type: 'integer' },
            pausedExecutions: { type: 'integer' },
            successRate: { type: 'number', description: 'successfulExecutions / totalExecutions, 0-1' },
            recentExecutionsCount: { type: 'integer', description: 'Executions started in last 24h' },
          },
        },
        WebhookPayload: {
          type: 'object',
          description: 'Arbitrary JSON. Example: event payload from external service.',
          additionalProperties: true,
        },
        WebhookTriggerResponse: {
          type: 'object',
          required: ['executionId', 'status'],
          properties: {
            executionId: { type: 'string', format: 'uuid', description: 'Created execution id' },
            status: { type: 'string', enum: ['queued'], description: 'Execution is in queue' },
          },
        },
        Execution: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            workflowId: { type: 'string', format: 'uuid' },
            triggerType: { type: 'string', enum: ['manual', 'webhook', 'schedule', 'email'] },
            status: { type: 'string', enum: ['pending', 'running', 'success', 'failed', 'paused'] },
            inputPayload: { type: 'object' },
            outputPayload: { type: 'object' },
            errorMessage: { type: 'string' },
            startedAt: { type: 'string', format: 'date-time' },
            finishedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ExecutionStep: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            executionId: { type: 'string', format: 'uuid' },
            nodeId: { type: 'string' },
            nodeName: { type: 'string', nullable: true },
            nodeType: { type: 'string' },
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
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            status: { type: 'string' },
            isPaused: { type: 'boolean' },
          },
        },
        ExecutionDetail: {
          type: 'object',
          description: 'Execution with steps and workflow basic info',
          properties: {
            id: { type: 'string', format: 'uuid' },
            workflowId: { type: 'string', format: 'uuid' },
            triggerType: { type: 'string' },
            status: { type: 'string' },
            inputPayload: { type: 'object' },
            outputPayload: { type: 'object' },
            errorMessage: { type: 'string' },
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
            total: { type: 'integer', description: 'Total count' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
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
