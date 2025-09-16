const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SkillLift API Documentation',
      version: '1.0.0',
      description: 'Comprehensive API documentation for the SkillLift learning platform',
      contact: {
        name: 'SkillLift Team',
        email: 'support@skilllift.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.skilllift.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'tutor', 'learner'] },
            accountStatus: { type: 'string', enum: ['pending', 'approved', 'blocked'] },
            profilePicture: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Course: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            tutor: { $ref: '#/components/schemas/User' },
            category: { type: 'string' },
            price: { type: 'number' },
            courseType: { type: 'string', enum: ['online-prerecorded', 'online-live', 'physical'] },
            status: { type: 'string', enum: ['draft', 'pending', 'published', 'archived', 'rejected'] },
            isApproved: { type: 'boolean' },
            totalEnrollments: { type: 'number' },
            rating: { type: 'number' },
            totalRatings: { type: 'number' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
