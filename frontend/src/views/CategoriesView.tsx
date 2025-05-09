import React, { useState, useEffect } from 'react';
import { useCategoryStore } from '@/stores/categoryStore';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useToast } from '@/hooks/use-toast';

// Define types
interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  bookmarkCount?: number;
}

// Mock icons for categories
const ICONS = [
  { value: 'code', label: '💻 Code' },
  { value: 'doc', label: '📄 Document' },
  { value: 'video', label: '🎬 Video' },
  { value: 'book', label: '📚 Book' },
  { value: 'shop', label: '🛒 Shopping' },
  { value: 'news', label: '📰 News' },
  { value: 'social', label: '👥 Social' },
  { value: 'tool', label: '🔧 Tool' },
  { value: 'education', label: '🎓 Education' },
  { value: 'game', label: '🎮 Game' },
  { value: 'music', label: '🎵 Music' },
  { value: 'travel', label: '✈️ Travel' },
  { value: 'finance', label: '💰 Finance' },
];

// Predefined colors
const COLORS = [
  { value: '#00c3ff', label: 'Blue Neon' },
  { value: '#ff00aa', label: 'Pink Neon' },
  { value: '#39ff14', label: 'Green Neon' },
  { value: '#ffea00', label: 'Yellow Neon' },
  { value: '#ff3131', label: 'Red' },
  { value: '#9933ff', label: 'Purple' },
  { value: '#ff8800', label: 'Orange' },
  { value: '#00ffcc', label: 'Teal' },
  { value: '#ff66b2', label: 'Light Pink' },
  { value: '#00ff99', label: 'Mint' },
];

const CategoriesView: React.FC = () => {
  // For toast notifications
  const { toast } = useToast();

  // States for the component
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookmarkCounts, setBookmarkCounts] = useState<{[categoryId: string]: number}>({});
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    color: COLORS[0].value,
    icon: ICONS[0].value
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'bookmarkCount'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Call this when we need to reset the form
  const resetForm = () => {
    setNewCategory({
      name: '',
      color: COLORS[0].value,
      icon: ICONS[0].value
    });
    setIsAdding(false);
    setEditingCategory(null);
  };

  // Mock data - in a real app, this would come from useCategoryStore and useBookmarkStore
  useEffect(() => {
    const mockCategories: Category[] = [
      { id: '1', name: 'Development', color: '#00c3ff', icon: 'code' },
      { id: '2', name: 'Design', color: '#ff00aa', icon: 'doc' },
      { id: '3', name: 'News', color: '#39ff14', icon: 'news' },
      { id: '4', name: 'Education', color: '#ffea00', icon: 'education' },
      { id: '5', name: 'Entertainment', color: '#9933ff', icon: 'video' },
    ];
    
    const mockBookmarkCounts: {[categoryId: string]: number} = {
      '1': 12,
      '2': 8,
      '3': 15,
      '4': 5,
      '5': 7,
    };
    
    setCategories(mockCategories);
    setBookmarkCounts(mockBookmarkCounts);
    
    // In a real app, fetch data from stores:
    // const { categories } = useCategoryStore();
    // const { bookmarks } = useBookmarkStore();
    
    // Calculate bookmark counts
    // const counts = {};
    // bookmarks.forEach(bookmark => {
    //   if (bookmark.categoryId) {
    //     counts[bookmark.categoryId] = (counts[bookmark.categoryId] || 0) + 1;
    //   }
    // });
    // setBookmarkCounts(counts);
  }, []);

  // Sorting function
  const sortedCategories = [...categories].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      const countA = bookmarkCounts[a.id] || 0;
      const countB = bookmarkCounts[b.id] || 0;
      return sortDirection === 'asc' ? countA - countB : countB - countA;
    }
  });

  // Toggle sort direction or change sort field
  const handleSort = (field: 'name' | 'bookmarkCount') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (editingCategory) {
      setEditingCategory({ ...editingCategory, [name]: value });
    } else {
      setNewCategory({ ...newCategory, [name]: value });
    }
  };

  // Handle adding a new category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name || !newCategory.color || !newCategory.icon) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }
    
    // In a real app, you would use the store to add the category
    // const { addCategory } = useCategoryStore();
    // addCategory({ ...newCategory });
    
    // For now, simulate adding to our local state
    const newId = String(categories.length + 1);
    const categoryToAdd = {
      ...newCategory,
      id: newId
    } as Category;
    
    setCategories([...categories, categoryToAdd]);
    setBookmarkCounts({ ...bookmarkCounts, [newId]: 0 });
    
    toast({
      title: 'Success',
      description: `Category "${newCategory.name}" added`,
    });
    
    resetForm();
  };

  // Handle updating a category
  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory || !editingCategory.name || !editingCategory.color || !editingCategory.icon) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }
    
    // In a real app, you would use the store to update the category
    // const { updateCategory } = useCategoryStore();
    // updateCategory(editingCategory);
    
    // For now, simulate updating our local state
    setCategories(
      categories.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      )
    );
    
    toast({
      title: 'Success',
      description: `Category "${editingCategory.name}" updated`,
    });
    
    resetForm();
  };

  // Handle deleting a category
  const handleDeleteCategory = (id: string) => {
    // In a real app, you would use the store to delete the category
    // const { deleteCategory } = useCategoryStore();
    // deleteCategory(id);
    
    // For now, simulate deleting from our local state
    setCategories(categories.filter(cat => cat.id !== id));
    
    const categoryName = categories.find(c => c.id === id)?.name;
    toast({
      title: 'Success',
      description: `Category "${categoryName}" deleted`,
    });
    
    setIsDeleting(null);
  };

  // Start editing a category
  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setIsAdding(false);
  };

  // Get icon label from value
  const getIconLabel = (value: string) => {
    return ICONS.find(icon => icon.value === value)?.label.split(' ')[0] || '📁';
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl bg-[#121212] text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#00c3ff] to-[#ff00aa]">
        Category Management
      </h1>
      
      {/* Add button and sorting controls */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-[#00c3ff] to-[#ff00aa] text-white rounded-md hover:opacity-90 transition-all shadow-[0_0_10px_rgba(0,195,255,0.3)]"
        >
          + Add New Category
        </button>
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">Sort by:</span>
          <button 
            onClick={() => handleSort('name')}
            className={`px-3 py-1 rounded-md transition-colors ${
              sortBy === 'name' ? 'bg-[#1e1e1e] text-[#00c3ff]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            onClick={() => handleSort('bookmarkCount')}
            className={`px-3 py-1 rounded-md transition-colors ${
              sortBy === 'bookmarkCount' ? 'bg-[#1e1e1e] text-[#00c3ff]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Bookmark Count {sortBy === 'bookmarkCount' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>
      
      {/* Category Form (Add/Edit) */}
      {(isAdding || editingCategory) && (
        <div className="mb-8 p-5 border border-[#333] rounded-md bg-[#1e1e1e] shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-[#00c3ff]">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          
          <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-300">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={editingCategory ? editingCategory.name : newCategory.name}
                onChange={handleInputChange}
                className="w-full p-2 bg-[#2a2a2a] border-2 border-[#444] rounded text-white focus:border-[#00c3ff] focus:ring-[#00c3ff]"
                placeholder="Category name"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="color" className="block text-sm font-medium mb-1 text-gray-300">Color</label>
                <div className="flex items-center space-x-2">
                  <select
                    id="color"
                    name="color"
                    value={editingCategory ? editingCategory.color : newCategory.color}
                    onChange={handleInputChange}
                    className="flex-grow p-2 bg-[#2a2a2a] border-2 border-[#444] rounded text-white focus:border-[#00c3ff] focus:ring-[#00c3ff]"
                    required
                  >
                    {COLORS.map(color => (
                      <option key={color.value} value={color.value}>{color.label}</option>
                    ))}
                  </select>
                  <div 
                    className="w-10 h-10 rounded-full border-2 border-[#444]" 
                    style={{ backgroundColor: editingCategory ? editingCategory.color : newCategory.color }}
                  ></div>
                </div>
              </div>
              
              <div>
                <label htmlFor="icon" className="block text-sm font-medium mb-1 text-gray-300">Icon</label>
                <select
                  id="icon"
                  name="icon"
                  value={editingCategory ? editingCategory.icon : newCategory.icon}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-[#2a2a2a] border-2 border-[#444] rounded text-white focus:border-[#00c3ff] focus:ring-[#00c3ff]"
                  required
                >
                  {ICONS.map(icon => (
                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-[#444] rounded-md text-gray-300 hover:bg-[#2a2a2a] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-[#00c3ff] to-[#ff00aa] text-white rounded-md hover:opacity-90 transition-all shadow-[0_0_10px_rgba(0,195,255,0.3)]"
              >
                {editingCategory ? 'Update' : 'Add'} Category
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Categories List */}
      <div className="w-full overflow-hidden border border-[#333] rounded-md bg-[#1e1e1e] shadow-md">
        <div className="grid grid-cols-12 p-4 border-b border-[#333] bg-[#2a2a2a] font-medium">
          <div className="col-span-1 text-gray-400">Icon</div>
          <div className="col-span-4 text-gray-400">Name</div>
          <div className="col-span-2 text-gray-400">Color</div>
          <div className="col-span-2 text-gray-400">Bookmarks</div>
          <div className="col-span-3 text-gray-400 text-right">Actions</div>
        </div>
        
        {sortedCategories.length > 0 ? (
          <div className="divide-y divide-[#333]">
            {sortedCategories.map(category => (
              <div key={category.id} className="grid grid-cols-12 p-4 items-center hover:bg-[#2a2a2a] transition-colors">
                <div className="col-span-1 text-xl">
                  {getIconLabel(category.icon)}
                </div>
                <div className="col-span-4 font-medium">{category.name}</div>
                <div className="col-span-2 flex items-center">
                  <div className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                  <span className="text-sm text-gray-400">{category.color}</span>
                </div>
                <div className="col-span-2">
                  <span className="px-2 py-1 rounded-full bg-[#2a2a2a] text-sm">
                    {bookmarkCounts[category.id] || 0} bookmarks
                  </span>
                </div>
                <div className="col-span-3 text-right space-x-2">
                  <button
                    onClick={() => startEdit(category)}
                    className="px-3 py-1 bg-[#2a2a2a] border border-[#00c3ff] text-[#00c3ff] rounded hover:bg-[#00c3ff20] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setIsDeleting(category.id)}
                    className="px-3 py-1 bg-[#2a2a2a] border border-[#ff3131] text-[#ff3131] rounded hover:bg-[#ff313120] transition-colors"
                    disabled={Boolean(bookmarkCounts[category.id])}
                    title={Boolean(bookmarkCounts[category.id]) ? "Cannot delete categories with bookmarks" : ""}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-400">
            No categories found. Create your first category to get started.
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-lg border border-[#333] w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-red-500">Confirm Delete</h3>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleting(null)}
                className="px-4 py-2 border border-[#444] rounded-md text-gray-300 hover:bg-[#2a2a2a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCategory(isDeleting)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesView; 