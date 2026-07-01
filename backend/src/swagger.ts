import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Realway Aura Admin Dashboard API',
    version: '1.0.0',
    description: 'API documentation for Realway Aura Real-Time Admin Dashboard',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Login via /api/auth/login to obtain a JWT token.',
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'Generate an API key from System Settings → API Keys.',
      },
    },
  },
  security: [
    { BearerAuth: [] },
    { ApiKeyAuth: [] },
  ],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        description: 'Returns the status of the API',
        responses: {
          '200': {
            description: 'Successful response',
          },
        },
      },
    },
  },
};

export const setupSwagger = (app: Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('Swagger documentation available at /api-docs');
};
