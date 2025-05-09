import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import { app } from './app';

const prisma = new PrismaClient();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Load OpenAPI specification
const openApiPath = path.join(__dirname, '../openapi.yaml');
const openApiSpec = YAML.parse(fs.readFileSync(openApiPath, 'utf8'));

// Swagger UI setup with custom options
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BookmarkBrain API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    syntaxHighlight: {
      activated: true,
      theme: 'monokai'
    }
  }
}));

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
}); 