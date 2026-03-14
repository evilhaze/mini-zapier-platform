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
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerSpec);
