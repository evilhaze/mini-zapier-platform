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
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerSpec);
