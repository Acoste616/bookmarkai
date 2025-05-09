import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// GET /api/backup
router.get('/backup', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    // Pobierz wszystkie dane użytkownika
    const [bookmarks, categories] = await Promise.all([
      prisma.bookmark.findMany({ where: { userId } }),
      prisma.category.findMany({ where: { userId } })
    ]);
    res.json({
      success: true,
      data: {
        bookmarks,
        categories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Backup error' });
  }
});

// POST /api/restore
const RestoreSchema = z.object({
  bookmarks: z.array(z.any()),
  categories: z.array(z.any())
});

router.post('/restore', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { bookmarks, categories } = RestoreSchema.parse(req.body);

    // Usuwamy stare dane użytkownika
    await prisma.bookmark.deleteMany({ where: { userId } });
    await prisma.category.deleteMany({ where: { userId } });

    // Przywracamy kategorie
    for (const category of categories) {
      await prisma.category.create({ data: { ...category, userId } });
    }
    // Przywracamy zakładki
    for (const bookmark of bookmarks) {
      await prisma.bookmark.create({ data: { ...bookmark, userId } });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Restore error' });
  }
});

export default router; 