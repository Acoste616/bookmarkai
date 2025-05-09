import { api } from './api';

// Placeholder for bookmark utility functions

export interface BookmarkData {
  id?: string;
  url: string;
  title?: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  lastVisited?: Date;
  visitCount?: number;
  metadata?: Record<string, any>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

/**
 * Utility functions for bookmark management
 */
export const bookmarkUtils = {
  /**
   * Fetches all bookmarks
   */
  async getBookmarks(): Promise<BookmarkData[]> {
    try {
      const response = await api.get<ApiResponse<BookmarkData[]>>('/bookmarks');
      
      if (response.data.success && response.data.data) {
        // Convert date strings to Date objects
        return response.data.data.map(bookmark => ({
          ...bookmark,
          createdAt: bookmark.createdAt ? new Date(bookmark.createdAt) : undefined,
          updatedAt: bookmark.updatedAt ? new Date(bookmark.updatedAt) : undefined,
          lastVisited: bookmark.lastVisited ? new Date(bookmark.lastVisited) : undefined
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      throw error;
    }
  },

  /**
   * Fetches a single bookmark by ID
   */
  async getBookmark(id: string): Promise<BookmarkData | null> {
    try {
      const response = await api.get<ApiResponse<BookmarkData>>(`/bookmarks/${id}`);
      
      if (response.data.success && response.data.data) {
        const bookmark = response.data.data;
        
        // Convert date strings to Date objects
        return {
          ...bookmark,
          createdAt: bookmark.createdAt ? new Date(bookmark.createdAt) : undefined,
          updatedAt: bookmark.updatedAt ? new Date(bookmark.updatedAt) : undefined,
          lastVisited: bookmark.lastVisited ? new Date(bookmark.lastVisited) : undefined
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching bookmark ${id}:`, error);
      throw error;
    }
  },

  /**
   * Adds a new bookmark
   */
  async addBookmark(bookmarkData: BookmarkData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const response = await api.post<ApiResponse<BookmarkData>>('/bookmarks', bookmarkData);
      
      if (response.data.success && response.data.data) {
        return { 
          success: true, 
          id: response.data.data.id 
        };
      }
      
      return { 
        success: false, 
        error: response.data.error || 'Failed to add bookmark' 
      };
    } catch (error: any) {
      console.error('Error adding bookmark:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred while adding the bookmark' 
      };
    }
  },

  /**
   * Updates an existing bookmark
   */
  async updateBookmark(id: string, bookmarkData: Partial<BookmarkData>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await api.put<ApiResponse<BookmarkData>>(`/bookmarks/${id}`, bookmarkData);
      
      return { 
        success: response.data.success, 
        error: response.data.error 
      };
    } catch (error: any) {
      console.error(`Error updating bookmark ${id}:`, error);
      return { 
        success: false, 
        error: error.message || 'An error occurred while updating the bookmark' 
      };
    }
  },

  /**
   * Deletes a bookmark
   */
  async deleteBookmark(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/bookmarks/${id}`);
      
      return { 
        success: response.data.success, 
        error: response.data.error 
      };
    } catch (error: any) {
      console.error(`Error deleting bookmark ${id}:`, error);
      return { 
        success: false, 
        error: error.message || 'An error occurred while deleting the bookmark' 
      };
    }
  },

  /**
   * Records a visit to a bookmark
   */
  async recordVisit(id: string): Promise<void> {
    try {
      await api.post(`/bookmarks/${id}/visit`);
    } catch (error) {
      console.error(`Error recording visit for bookmark ${id}:`, error);
      // Don't throw, as this is not critical
    }
  },

  /**
   * Import bookmarks from a file
   */
  async importFromFile(formData: FormData): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await api.post<ApiResponse<{ count: number }>>('/bookmarks/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        return { 
          success: true, 
          message: `Successfully imported ${response.data.data?.count || 0} bookmarks` 
        };
      }
      
      return { 
        success: false, 
        error: response.data.error || 'Import failed' 
      };
    } catch (error: any) {
      console.error('Error importing bookmarks from file:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during import' 
      };
    }
  },

  /**
   * Import bookmarks from text (URLs, one per line)
   */
  async importFromText(text: string, options?: { auto_categorize?: boolean }): Promise<{ success: boolean; message?: string; count?: number; error?: string }> {
    try {
      const urls = text.split('\n')
        .map(line => line.trim())
        .filter(line => line && line.includes('.'));
      
      if (urls.length === 0) {
        return { success: false, error: 'No valid URLs found in the text' };
      }
      
      const response = await api.post<ApiResponse<{ count: number }>>('/bookmarks/import/text', {
        urls,
        options
      });
      
      if (response.data.success) {
        return { 
          success: true, 
          message: `Successfully imported ${response.data.data?.count || 0} bookmarks`, 
          count: response.data.data?.count 
        };
      }
      
      return { 
        success: false, 
        error: response.data.error || 'Import failed' 
      };
    } catch (error: any) {
      console.error('Error importing bookmarks from text:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during import' 
      };
    }
  },

  /**
   * Export bookmarks to JSON or CSV
   */
  async exportBookmarks(format: 'json' | 'csv' = 'json'): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const response = await api.get<ApiResponse<{ data: string }>>(`/bookmarks/export?format=${format}`);
      
      if (response.data.success && response.data.data) {
        return { 
          success: true, 
          data: response.data.data.data 
        };
      }
      
      return { 
        success: false, 
        error: response.data.error || 'Export failed' 
      };
    } catch (error: any) {
      console.error('Error exporting bookmarks:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during export' 
      };
    }
  },

  /**
   * Analyze a bookmark with AI
   */
  async analyzeBookmark(id: string): Promise<{ success: boolean; analysis?: string; error?: string }> {
    try {
      const response = await api.post<ApiResponse<{ analysis: string }>>(`/bookmarks/${id}/analyze`);
      
      if (response.data.success && response.data.data) {
        return { 
          success: true, 
          analysis: response.data.data.analysis 
        };
      }
      
      return { 
        success: false, 
        error: response.data.error || 'Analysis failed' 
      };
    } catch (error: any) {
      console.error(`Error analyzing bookmark ${id}:`, error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during analysis' 
      };
    }
  },

  /**
   * Get related bookmarks for a specific bookmark
   */
  async getRelatedBookmarks(id: string): Promise<BookmarkData[]> {
    try {
      const response = await api.get<ApiResponse<BookmarkData[]>>(`/bookmarks/${id}/related`);
      
      if (response.data.success && response.data.data) {
        // Convert date strings to Date objects
        return response.data.data.map(bookmark => ({
          ...bookmark,
          createdAt: bookmark.createdAt ? new Date(bookmark.createdAt) : undefined,
          updatedAt: bookmark.updatedAt ? new Date(bookmark.updatedAt) : undefined,
          lastVisited: bookmark.lastVisited ? new Date(bookmark.lastVisited) : undefined
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching related bookmarks for ${id}:`, error);
      throw error;
    }
  }
}; 