import { Router } from 'express';
import { z } from 'zod';
import { appContext } from '../server';

const router = Router();

// Validation schemas
const BookmarkSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

// Get all bookmarks
router.get('/', async (req, res, next) => {
  try {
    const bookmarks = await appContext.prisma.bookmark.findMany({
      include: {
        category: true,
        tags: true,
      },
    });
    res.json({ success: true, data: bookmarks });
  } catch (error) {
    next(error);
  }
});

// Get a single bookmark
router.get('/:id', async (req, res, next) => {
  try {
    const bookmark = await appContext.prisma.bookmark.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        tags: true,
      },
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: 'Bookmark not found',
      });
    }

    res.json({ success: true, data: bookmark });
  } catch (error) {
    next(error);
  }
});

// Create a new bookmark
router.post('/', async (req, res, next) => {
  try {
    const bookmarkData = BookmarkSchema.parse(req.body);
    
    const bookmark = await appContext.prisma.bookmark.create({
      data: {
        ...bookmarkData,
        tags: bookmarkData.tags ? {
          connectOrCreate: bookmarkData.tags.map(tag => ({
            where: { name: tag },
            create: { name: tag },
          })),
        } : undefined,
      },
      include: {
        category: true,
        tags: true,
      },
    });

    res.status(201).json({ success: true, data: bookmark });
  } catch (error) {
    next(error);
  }
});

// Update a bookmark
router.put('/:id', async (req, res, next) => {
  try {
    const bookmarkData = BookmarkSchema.partial().parse(req.body);
    
    const bookmark = await appContext.prisma.bookmark.update({
      where: { id: req.params.id },
      data: {
        ...bookmarkData,
        tags: bookmarkData.tags ? {
          set: [],
          connectOrCreate: bookmarkData.tags.map(tag => ({
            where: { name: tag },
            create: { name: tag },
          })),
        } : undefined,
      },
      include: {
        category: true,
        tags: true,
      },
    });

    res.json({ success: true, data: bookmark });
  } catch (error) {
    next(error);
  }
});

// Delete a bookmark
router.delete('/:id', async (req, res, next) => {
  try {
    await appContext.prisma.bookmark.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Record a visit
router.post('/:id/visit', async (req, res, next) => {
  try {
    const bookmark = await appContext.prisma.bookmark.update({
      where: { id: req.params.id },
      data: {
        lastVisited: new Date(),
        visitCount: {
          increment: 1,
        },
      },
    });

    res.json({ success: true, data: bookmark });
  } catch (error) {
    next(error);
  }
});

// Analyze a bookmark
router.post('/:id/analyze', async (req, res, next) => {
  try {
    const bookmark = await appContext.prisma.bookmark.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        tags: true,
      },
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: 'Bookmark not found',
      });
    }

    const analysis = await appContext.llmClient.analyzeText(
      `Analyze this bookmark:
        Title: ${bookmark.title}
        URL: ${bookmark.url}
        Description: ${bookmark.description || 'No description'}
        Category: ${bookmark.category?.name || 'Uncategorized'}
        Tags: ${bookmark.tags.map(t => t.name).join(', ')}
      `
    );

    res.json({ success: true, data: { analysis } });
  } catch (error) {
    next(error);
  }
});

// Get related bookmarks
router.get('/:id/related', async (req, res, next) => {
  try {
    const bookmark = await appContext.prisma.bookmark.findUnique({
      where: { id: req.params.id },
      include: {
        tags: true,
      },
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: 'Bookmark not found',
      });
    }

    // Find bookmarks with similar tags
    const relatedBookmarks = await appContext.prisma.bookmark.findMany({
      where: {
        id: { not: bookmark.id },
        tags: {
          some: {
            name: {
              in: bookmark.tags.map(t => t.name),
            },
          },
        },
      },
      include: {
        category: true,
        tags: true,
      },
      take: 5,
    });

    res.json({ success: true, data: relatedBookmarks });
  } catch (error) {
    next(error);
  }
});

export default router; 