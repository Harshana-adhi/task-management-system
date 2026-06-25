const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Task Management System API',
            version: '1.0.0',
            description:
                'REST API for the Task Management System (INTE 21323 Group Project). ' +
                'Provides authentication, project/task management, comments, attachments, ' +
                'and real-time notifications over Socket.io.',
        },
        servers: [
            {
                url: process.env.API_BASE_URL || 'https://task-management-system-backend-spcl.onrender.com',
                description: 'Deployed (Render)',
            },
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: 'Local development',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'Bad Request' },
                        message: { type: 'string', example: 'Invalid input data' },
                    },
                },
                ValidationErrorResponse: {
                    type: 'object',
                    properties: {
                        error_code: { type: 'string', example: 'VALIDATION_ERROR' },
                        message: { type: 'string', example: 'Invalid input data' },
                        details: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: { type: 'string', example: 'email' },
                                    message: { type: 'string', example: '"email" must be a valid email' },
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                Unauthorized: {
                    description: 'Missing, invalid, or expired JWT',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            example: { error: 'Unauthorized', message: 'No token provided' },
                        },
                    },
                },
                Forbidden: {
                    description: 'Authenticated but not permitted to perform this action',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            example: { error: 'Forbidden', message: 'You do not have permission to perform this action' },
                        },
                    },
                },
                NotFound: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            example: { error: 'Not Found', message: 'Resource not found' },
                        },
                    },
                },
                ValidationError: {
                    description: 'Request failed schema validation',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
                        },
                    },
                },
                ServerError: {
                    description: 'Unexpected server error',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            example: { error: 'Internal Server Error', message: 'An unexpected error occurred' },
                        },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'Auth', description: 'Login, password management, profile' },
            { name: 'Users', description: 'User administration (Admin only)' },
            { name: 'Projects', description: 'Project CRUD, members, archiving, manager assignment' },
            { name: 'Tasks', description: 'Task CRUD, status, assignment, filtering' },
            { name: 'Comments', description: 'Task comments' },
            { name: 'Attachments', description: 'File uploads attached to tasks' },
            { name: 'Notifications', description: 'In-app notifications and admin broadcasts' },
        ],
    },
    apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);