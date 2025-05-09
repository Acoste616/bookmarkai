import { api } from '../lib/api';
import { useBookmarkStore } from '../stores/bookmarkStore';
import { useCategoryStore } from '../stores/categoryStore';

export class SyncService {
  private static instance: SyncService;
  private syncInProgress = false;
  private lastSyncTime: number | null = null;

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private async getClientData() {
    const bookmarkStore = useBookmarkStore.getState();
    const categoryStore = useCategoryStore.getState();

    return {
      bookmarks: bookmarkStore.bookmarks.map(b => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString()
      })),
      categories: categoryStore.categories.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString()
      }))
    };
  }

  private async applyServerData(data: any) {
    const bookmarkStore = useBookmarkStore.getState();
    const categoryStore = useCategoryStore.getState();

    // Apply categories first
    if (data.categories?.length) {
      categoryStore.setCategories(data.categories.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      })));
    }

    // Then apply bookmarks
    if (data.bookmarks?.length) {
      bookmarkStore.setBookmarks(data.bookmarks.map((b: any) => ({
        ...b,
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.updatedAt)
      })));
    }
  }

  async sync() {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    try {
      this.syncInProgress = true;
      const clientData = await this.getClientData();

      // Upload client data and get server changes
      const response = await api.post('/api/sync/upload', clientData);
      
      if (response.data.success && response.data.data) {
        await this.applyServerData(response.data.data);
        this.lastSyncTime = Date.now();
        console.log('Sync completed successfully');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  async checkForUpdates() {
    if (this.syncInProgress) {
      return;
    }

    try {
      const clientData = await this.getClientData();
      const response = await api.post('/api/sync/download', clientData);
      
      if (response.data.success && response.data.data) {
        const hasUpdates = 
          (response.data.data.bookmarks?.length > 0) || 
          (response.data.data.categories?.length > 0);

        if (hasUpdates) {
          await this.applyServerData(response.data.data);
          this.lastSyncTime = Date.now();
          console.log('Updates applied successfully');
        }
      }
    } catch (error) {
      console.error('Check for updates failed:', error);
    }
  }

  getLastSyncTime(): number | null {
    return this.lastSyncTime;
  }
} 