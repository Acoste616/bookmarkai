import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Schema for client data
const ClientDataSchema = z.object({
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

type ClientData = z.infer<typeof ClientDataSchema>;

export class SyncService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getServerData(userId: string): Promise<ClientData> {
    const [bookmarks, categories] = await Promise.all([
      this.prisma.bookmark.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      }),
      this.prisma.category.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      })
    ]);

    return {
      bookmarks: bookmarks.map(b => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString()
      })),
      categories: categories.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString()
      }))
    };
  }

  async calculateDiff(userId: string, clientData: ClientData): Promise<{
    toUpload: ClientData;
    toDownload: ClientData;
  }> {
    const serverData = await this.getServerData(userId);

    // Calculate differences
    const toUpload = {
      bookmarks: clientData.bookmarks.filter(clientB => {
        const serverB = serverData.bookmarks.find(sb => sb.id === clientB.id);
        return !serverB || new Date(clientB.updatedAt) > new Date(serverB.updatedAt);
      }),
      categories: clientData.categories.filter(clientC => {
        const serverC = serverData.categories.find(sc => sc.id === clientC.id);
        return !serverC || new Date(clientC.updatedAt) > new Date(serverC.updatedAt);
      })
    };

    const toDownload = {
      bookmarks: serverData.bookmarks.filter(serverB => {
        const clientB = clientData.bookmarks.find(cb => cb.id === serverB.id);
        return !clientB || new Date(serverB.updatedAt) > new Date(clientB.updatedAt);
      }),
      categories: serverData.categories.filter(serverC => {
        const clientC = clientData.categories.find(cc => cc.id === serverC.id);
        return !clientC || new Date(serverC.updatedAt) > new Date(clientC.updatedAt);
      })
    };

    return { toUpload, toDownload };
  }

  async applyUpload(userId: string, data: ClientData): Promise<void> {
    // Handle categories first since bookmarks depend on them
    for (const category of data.categories) {
      await this.prisma.category.upsert({
        where: { id: category.id },
        update: {
          name: category.name,
          color: category.color,
          updatedAt: new Date(category.updatedAt)
        },
        create: {
          id: category.id,
          name: category.name,
          color: category.color,
          userId,
          createdAt: new Date(category.createdAt),
          updatedAt: new Date(category.updatedAt)
        }
      });
    }

    // Then handle bookmarks
    for (const bookmark of data.bookmarks) {
      await this.prisma.bookmark.upsert({
        where: { id: bookmark.id },
        update: {
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description,
          categoryId: bookmark.categoryId,
          metadata: bookmark.metadata,
          updatedAt: new Date(bookmark.updatedAt)
        },
        create: {
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description,
          categoryId: bookmark.categoryId,
          metadata: bookmark.metadata,
          userId,
          createdAt: new Date(bookmark.createdAt),
          updatedAt: new Date(bookmark.updatedAt)
        }
      });
    }
  }
} 