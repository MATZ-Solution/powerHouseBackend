// SWAGGER
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Basic Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'POWERHOUSE API',
    version: '1.0.0',
    description: 'A simple Express API',
  },
  servers: [
    {
      url: 'https://powerhouseserver.matzsolutions.com',
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
  },
  security: [{
    bearerAuth: []
  }],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js', './controllers/*.js'], // Files containing Swagger annotations
};
 
const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };

