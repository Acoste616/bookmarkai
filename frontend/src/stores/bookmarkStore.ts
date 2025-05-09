import { create } from 'zustand';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
  createdAt: Date; // Or string, adjust based on your data model
  updatedAt: Date; // Or string
  // Add other fields as necessary
}

interface BookmarkState {
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  setBookmarks: (bookmarks: Bookmark[]) => void;
  addBookmark: (bookmark: Bookmark) => void;
  updateBookmark: (bookmark: Bookmark) => void;
  deleteBookmark: (id: string) => void;
  fetchBookmarks: () => Promise<void>; // Example async action
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  isLoading: false,
  error: null,
  setBookmarks: (bookmarks) => set({ bookmarks, isLoading: false, error: null }),
  addBookmark: (bookmark) => set((state) => ({ bookmarks: [...state.bookmarks, bookmark] })),
  updateBookmark: (bookmark) =>
    set((state) => ({
      bookmarks: state.bookmarks.map((b) => (b.id === bookmark.id ? bookmark : b)),
    })),
  deleteBookmark: (id) =>
    set((state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== id) })),
  fetchBookmarks: async () => {
    set({ isLoading: true, error: null });
    try {
      // const response = await api.get('/bookmarks'); // Assuming you have an api lib
      // const data = response.data;
      // set({ bookmarks: data, isLoading: false });
      console.log('fetchBookmarks called - implement API call');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      set({ isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to fetch bookmarks', isLoading: false });
    }
  },
})); 