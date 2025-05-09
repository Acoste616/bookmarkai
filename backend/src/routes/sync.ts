import { Router } from 'express';
import { z } from 'zod';
import { SyncService } from '../services/syncService';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();
const syncService = new SyncService(prisma);

// Schema for sync request
const SyncRequestSchema = z.object({
  bookmarks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    url: z.string(),
    description: z.string().nullable(),
    categoryId: z.string().nullable(),
    metadata: z.record(z.any()).optional(),
    createdAt: z.string(),
    updatedAt: z.string()
  })),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
  }))
});

// POST /api/sync/upload
router.post('/upload', requireAuth, async (req, res) => {
  try {
    const clientData = SyncRequestSchema.parse(req.body);
    const userId = req.user!.id;

    // Calculate differences
    const { toUpload, toDownload } = await syncService.calculateDiff(userId, clientData);

    // Apply client changes to server
    await syncService.applyUpload(userId, toUpload);

    // Return server changes to client
    res.json({
      success: true,
      data: toDownload
    });
  } catch (error) {
    console.error('Sync upload error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Invalid sync data'
    });
  }
});

// POST /api/sync/download
router.post('/download', requireAuth, async (req, res) => {
  try {
    const clientData = SyncRequestSchema.parse(req.body);
    const userId = req.user!.id;

    // Calculate differences
    const { toUpload, toDownload } = await syncService.calculateDiff(userId, clientData);

    // Return server changes to client
    res.json({
      success: true,
      data: toDownload
    });
  } catch (error) {
    console.error('Sync download error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Invalid sync data'
    });
  }
});

export default router; 