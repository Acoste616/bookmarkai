import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';

// Import routes
import bookmarkRoutes from './routes/bookmarks';
import categoryRoutes from './routes/categories';
import tagRoutes from './routes/tags';
import aiRoutes from './routes/ai';
import syncRoutes from './routes/sync';
import backupRoutes from './routes/backup';
import { LLMClient } from './services/llmClient';

// Create Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize LLM client
const llmClient = new LLMClient('http://localhost:1234/v1');

// Define shared context for routes
export const appContext = {
  prisma,
  llmClient
};

// Setup middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Swagger API documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BookmarkBrain API',
      version: '1.0.0',
      description: 'API for BookmarkBrain - the AI-enhanced bookmark manager',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount API routes
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api', backupRoutes); // /api/backup and /api/restore

// Error validation schema
const ErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
});

type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  const errorResponse: ErrorResponse = {
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred',
  };
  
  if (err.details) {
    errorResponse.details = err.details;
  }
  
  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    errorResponse.code = 'VALIDATION_ERROR';
    errorResponse.message = 'Validation error';
    errorResponse.details = err.errors;
    return res.status(400).json(errorResponse);
  }
  
  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      errorResponse.code = 'DUPLICATE_ENTRY';
      errorResponse.message = 'A record with this value already exists';
    } else if (err.code === 'P2025') {
      errorResponse.code = 'NOT_FOUND';
      errorResponse.message = 'Record not found';
      return res.status(404).json(errorResponse);
    }
  }
  
  // Handle LLM client errors
  if (err.name === 'LLMError') {
    errorResponse.code = 'LLM_ERROR';
    errorResponse.message = 'Error communicating with the language model';
    errorResponse.details = {
      llmErrorCode: err.code,
      llmErrorMessage: err.message,
    };
    return res.status(502).json(errorResponse);
  }
  
  // Default to 500 status code
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(errorResponse);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
}); 