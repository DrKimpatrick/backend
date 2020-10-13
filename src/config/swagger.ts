import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'REST API for Tech Talent',
    version: '1.0.0',
    description: 'Tech Talent API documentation',
  },
};

const apis = ['src/api/**/*.{ts,js}'];

const swaggerOptions = {
  swaggerDefinition,
  apis,
};

export default swaggerJsdoc(swaggerOptions);
