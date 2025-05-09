import { create } from 'zustand';

export interface Category {
  id: string;
  name: string;
  color?: string;
  // Add other fields as necessary
  createdAt: Date; // Or string
  updatedAt: Date; // Or string
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,
  setCategories: (categories) => set({ categories, isLoading: false, error: null }),
  addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
  updateCategory: (category) =>
    set((state) => ({
      categories: state.categories.map((c) => (c.id === category.id ? category : c)),
    })),
  deleteCategory: (id) =>
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) })),
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      // const response = await api.get('/categories');
      // const data = response.data;
      // set({ categories: data, isLoading: false });
      console.log('fetchCategories called - implement API call');
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to fetch categories', isLoading: false });
    }
  },
})); 