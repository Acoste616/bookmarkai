import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';

import backupRoutes from './routes/backup';
import syncRoutes from './routes/sync'; // Assuming sync routes will be created/used

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Load OpenAPI specification (assuming it will be in backend/openapi.yaml)
// If you don't have it yet, you might want to remove this section or create a placeholder openapi.yaml
let openApiSpec;
try {
  const openApiPath = path.join(__dirname, '../openapi.yaml'); 
  if (fs.existsSync(openApiPath)) {
    openApiSpec = YAML.parse(fs.readFileSync(openApiPath, 'utf8'));
  } else {
    // Placeholder Swagger Spec if openapi.yaml is missing
    openApiSpec = {
      openapi: '3.0.0',
      info: {
        title: 'BookmarkBrain API',
        version: '1.0.0',
        description: 'API for BookmarkBrain application',
      },
      paths: {},
    };
    console.warn("openapi.yaml not found at backend/openapi.yaml. Using placeholder spec for Swagger UI.")
  }
} catch (error) {
  console.error("Failed to load or parse openapi.yaml:", error);
  openApiSpec = { // Fallback spec on error
    openapi: '3.0.0',
    info: {
      title: 'BookmarkBrain API - Error Loading Spec',
      version: '1.0.0',
    },
    paths: {},
  };
}

// Swagger UI setup
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BookmarkBrain API Documentation',
  // customfavIcon: '/favicon.ico', // Add if you have a favicon in your public assets
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

// Mount API Routers
app.use('/api', backupRoutes);
app.use('/api/sync', syncRoutes); // Mounted under /api/sync

// Root API route for testing
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the BookmarkBrain API' });
});

export default app; 