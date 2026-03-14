import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mini-Zapier API',
      version: '0.1.0',
      description: 'MVP automation platform: workflows, triggers, actions, executions',
    },
    servers: [{ url: '/api', description: 'API root' }],
    paths: {
      '/workflows': {
        get: {
          summary: 'List workflows',
          tags: ['Workflows'],
          responses: { 200: { description: 'List of workflows' } },
        },
        post: {
          summary: 'Create workflow',
          tags: ['Workflows'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'definition'],
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    definition: { type: 'object', description: 'nodes + edges' },
                    enabled: { type: 'boolean', default: true },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Created' } },
        },
      },
      '/workflows/{id}': {
        get: { summary: 'Get workflow', tags: ['Workflows'], responses: { 200: {}, 404: {} } },
        put: { summary: 'Update workflow', tags: ['Workflows'], responses: { 200: {}, 404: {} } },
        delete: { summary: 'Delete workflow', tags: ['Workflows'], responses: { 204: {}, 404: {} } },
      },
      '/workflows/{id}/run': {
        post: {
          summary: 'Run workflow manually',
          tags: ['Workflows'],
          requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { 202: { description: 'Execution started', content: { 'application/json': { schema: { type: 'object', properties: { executionId: { type: 'string' } } } } } } },
        },
      },
      '/executions': {
        get: {
          summary: 'List executions',
          tags: ['Executions'],
          parameters: [{ name: 'workflowId', in: 'query' }, { name: 'limit', in: 'query', schema: { type: 'integer' } }],
          responses: { 200: {} },
        },
      },
      '/executions/stats': {
        get: {
          summary: 'Execution statistics',
          tags: ['Executions'],
          parameters: [{ name: 'workflowId', in: 'query' }],
          responses: { 200: {} },
        },
      },
      '/executions/{id}': {
        get: { summary: 'Get execution', tags: ['Executions'], responses: { 200: {}, 404: {} } },
      },
      '/executions/{id}/steps': {
        get: { summary: 'Get execution steps (logs)', tags: ['Executions'], responses: { 200: {} } },
      },
      '/webhooks/{workflowId}': {
        post: {
          summary: 'Trigger workflow by webhook',
          tags: ['Webhooks'],
          responses: { 202: {}, 404: {} },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerSpec);
