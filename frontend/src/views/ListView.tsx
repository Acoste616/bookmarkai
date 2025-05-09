import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useToast } from '@/hooks/use-toast';
import { BookmarkData } from '@/lib/bookmarkUtils';
import ImportModal from '@/components/ImportModal';

// Interface definitions
interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  tags: string[];
  createdAt: Date;
  lastVisited?: Date;
  visitCount: number;
}

// Cyberpunk Neon Colors for the UI
const NEON_COLORS = {
  blue: '#00c3ff',
  pink: '#ff00aa',
  green: '#39ff14',
  yellow: '#ffea00',
  red: '#ff1e1e',
  orange: '#ff7d00',
  teal: '#00d2b4',
  gold: '#ffd700',
  lime: '#b4ff14',
};

// Category to color mapping
const CATEGORY_COLORS: Record<string, string> = {
  'Search Engines': NEON_COLORS.blue,
  'CSS Frameworks': NEON_COLORS.pink,
  'JavaScript Libraries': NEON_COLORS.green,
  'Build Tools': NEON_COLORS.purple,
  'Development Tools': NEON_COLORS.blue,
  'Documentation': NEON_COLORS.yellow,
  'AI': NEON_COLORS.teal,
  'FUN': NEON_COLORS.pink,
  'Rozwoj osobisty': NEON_COLORS.lime,
  'Sport': NEON_COLORS.green,
  'Newsy': NEON_COLORS.orange,
  'Tesla': NEON_COLORS.red,
  'Filmy': NEON_COLORS.gold,
  'Biznes': NEON_COLORS.blue,
  'Uncategorized': '#999999'
};

// Sort options for the bookmarks
type SortOption = {
  label: string;
  value: keyof Bookmark | 'relevance';
  direction: 'asc' | 'desc';
};

const ListView = () => {
  // Fetch bookmarks from the store - using mock data for now
  // In a real implementation, this would use useBookmarkStore() and useCategoryStore()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // UI state
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>({ 
    label: 'Last Visited', 
    value: 'lastVisited', 
    direction: 'desc' 
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Mock data for demonstration
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      const MOCK_BOOKMARKS: Bookmark[] = [
        {
          id: 'bm1',
          title: 'Google',
          url: 'https://google.com',
          description: 'Search engine',
          category: 'Search Engines',
          tags: ['search', 'productivity'],
          createdAt: new Date('2023-01-01'),
          lastVisited: new Date('2023-05-15'),
          visitCount: 150
        },
        {
          id: 'bm2',
          title: 'Tailwind CSS',
          url: 'https://tailwindcss.com',
          description: 'A utility-first CSS framework',
          category: 'CSS Frameworks',
          tags: ['styling', 'dev', 'frontend'],
          createdAt: new Date('2023-02-10'),
          lastVisited: new Date('2023-05-10'),
          visitCount: 45
        },
        {
          id: 'bm3',
          title: 'React Documentation',
          url: 'https://reactjs.org/docs',
          description: 'Official React documentation',
          category: 'JavaScript Libraries',
          tags: ['docs', 'dev', 'frontend'],
          createdAt: new Date('2023-01-15'),
          lastVisited: new Date('2023-05-12'),
          visitCount: 78
        },
        {
          id: 'bm4',
          title: 'OpenAI',
          url: 'https://openai.com',
          description: 'AI research and deployment company',
          category: 'AI',
          tags: ['ai', 'ml', 'research'],
          createdAt: new Date('2023-03-20'),
          lastVisited: new Date('2023-05-11'),
          visitCount: 32
        },
        {
          id: 'bm5',
          title: 'Netflix',
          url: 'https://netflix.com',
          description: 'Streaming service for movies and TV shows',
          category: 'Filmy',
          tags: ['streaming', 'entertainment'],
          createdAt: new Date('2023-02-05'),
          lastVisited: new Date('2023-05-14'),
          visitCount: 28
        }
      ];
      
      setBookmarks(MOCK_BOOKMARKS);
      setFilteredBookmarks(MOCK_BOOKMARKS);
      setIsLoading(false);
    }, 800);
  }, []);
  
  // Extract unique categories and tags from bookmarks
  const categories = useMemo(() => 
    [...new Set(bookmarks.map(bm => bm.category))].sort(),
    [bookmarks]
  );
  
  const allTags = useMemo(() => 
    [...new Set(bookmarks.flatMap(bm => bm.tags))].sort(),
    [bookmarks]
  );
  
  // Sort options
  const sortOptions: SortOption[] = [
    { label: 'Title (A-Z)', value: 'title', direction: 'asc' },
    { label: 'Title (Z-A)', value: 'title', direction: 'desc' },
    { label: 'Last Visited', value: 'lastVisited', direction: 'desc' },
    { label: 'Most Visited', value: 'visitCount', direction: 'desc' },
    { label: 'Newest First', value: 'createdAt', direction: 'desc' },
    { label: 'Oldest First', value: 'createdAt', direction: 'asc' }
  ];
  
  // Filter and sort bookmarks when search or filters change
  useEffect(() => {
    if (isLoading) return;
    
    let result = [...bookmarks];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        bm => bm.title.toLowerCase().includes(search) || 
              bm.url.toLowerCase().includes(search) || 
              bm.description?.toLowerCase().includes(search) ||
              bm.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter(bm => selectedCategories.includes(bm.category));
    }
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      result = result.filter(bm => 
        bm.tags.some(tag => selectedTags.includes(tag))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortBy.value as keyof Bookmark];
      const bValue = b[sortBy.value as keyof Bookmark];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      // Handle date comparison
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortBy.direction === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortBy.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortBy.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      return 0;
    });
    
    setFilteredBookmarks(result);
  }, [bookmarks, searchTerm, selectedCategories, selectedTags, sortBy, isLoading]);
  
  // Toggle category filter
  const toggleCategoryFilter = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(cat => cat !== category) 
        : [...prev, category]
    );
  };
  
  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  // Handle bookmark deletion
  const handleDeleteBookmark = (id: string) => {
    // Would typically call API/store method
    setBookmarks(prev => prev.filter(bm => bm.id !== id));
    
    toast({
      title: "Bookmark deleted",
      description: "The bookmark has been successfully removed",
    });
    
    setIsDeleteModalOpen(null);
  };
  
  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  // Open URL in new tab
  const openUrl = (url: string, id: string) => {
    // In a real app, this would increment the visit count
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080825] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#00c3ff] border-r-[#00c3ff] border-b-[#ff00aa] border-l-[#ff00aa] border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-[#00c3ff] to-[#ff00aa]">
            Loading bookmarks...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080825] text-gray-100">
      {/* Header and controls */}
      <div className="bg-[#0a0a2a] border-b border-[#333] py-5 px-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00c3ff] to-[#ff00aa]">
                Bookmarks
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/">
                <a className="px-4 py-2 bg-[#1a1a3a] rounded hover:bg-[#252550] transition-colors duration-300 flex items-center">
                  <span className="mr-2">🔍</span>
                  Graph View
                </a>
              </Link>
              
              <Link href="/settings">
                <a className="px-4 py-2 bg-[#1a1a3a] rounded hover:bg-[#252550] transition-colors duration-300 flex items-center">
                  <span className="mr-2">⚙️</span>
                  Settings
                </a>
              </Link>
              
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                className="px-4 py-2 bg-[#1a1a3a] rounded hover:bg-[#252550] transition-colors duration-300 flex items-center"
              >
                <span className="mr-2">{viewMode === 'table' ? '🔲' : '📋'}</span>
                {viewMode === 'table' ? 'Grid View' : 'Table View'}
              </button>
              
              <div className="relative group">
                <select
                  value={`${sortBy.value}-${sortBy.direction}`}
                  onChange={(e) => {
                    const [value, direction] = e.target.value.split('-');
                    const option = sortOptions.find(
                      opt => opt.value === value && opt.direction === (direction as 'asc' | 'desc')
                    );
                    if (option) setSortBy(option);
                  }}
                  className="pl-3 pr-10 py-2 bg-[#1a1a3a] border border-[#333] rounded appearance-none focus:outline-none focus:ring-2 focus:ring-[#00c3ff] focus:border-transparent cursor-pointer"
                >
                  {sortOptions.map(option => (
                    <option 
                      key={`${option.value}-${option.direction}`} 
                      value={`${option.value}-${option.direction}`}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#00c3ff]">
                  ▼
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar filters */}
          <div className="md:col-span-1 bg-[#0a0a2a] p-4 rounded-lg border border-[#333] h-fit">
            <div className="mb-6">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search bookmarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-9 bg-[#1a1a3a] border border-[#333] rounded-md text-white focus:ring-2 focus:ring-[#00c3ff] focus:border-transparent transition-all duration-300"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-[#ff00aa]">Categories</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {categories.map(category => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategoryFilter(category)}
                      className="form-checkbox h-4 w-4 text-[#ff00aa] rounded border-[#444] focus:ring-[#ff00aa]"
                    />
                    <span 
                      className="inline-flex items-center"
                      style={{ color: selectedCategories.includes(category) ? CATEGORY_COLORS[category] : undefined }}
                    >
                      <span 
                        className="h-3 w-3 rounded-full mr-2"
                        style={{ backgroundColor: CATEGORY_COLORS[category] }}
                      ></span>
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-[#39ff14]">Tags</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {allTags.map(tag => (
                  <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTagFilter(tag)}
                      className="form-checkbox h-4 w-4 text-[#39ff14] rounded border-[#444] focus:ring-[#39ff14]"
                    />
                    <span 
                      className={`${selectedTags.includes(tag) ? 'text-[#39ff14]' : 'text-gray-300'}`}
                    >
                      #{tag}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategories([]);
                  setSelectedTags([]);
                }}
                className="w-full py-2 border border-[#333] text-gray-400 rounded-md hover:bg-[#1a1a3a] transition-colors duration-300"
              >
                Clear All Filters
              </button>
            </div>
          </div>
          
          {/* Bookmarks list */}
          <div className="md:col-span-3 bg-[#0a0a2a] rounded-lg border border-[#333] shadow-xl">
            {/* Bookmarks count and stats */}
            <div className="p-4 border-b border-[#333] flex justify-between items-center">
              <div className="text-gray-300">
                Showing <span className="text-[#00c3ff] font-bold">{filteredBookmarks.length}</span> of <span className="text-[#00c3ff] font-bold">{bookmarks.length}</span> bookmarks
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="p-2 bg-[#1a1a3a] text-[#39ff14] rounded hover:bg-[#252550] transition-colors duration-300"
                  title="Import Bookmarks"
                >
                  ↓
                </button>
                <button
                  onClick={() => toast({
                    title: "Feature coming soon",
                    description: "This feature is currently in development"
                  })}
                  className="p-2 bg-[#1a1a3a] text-[#00c3ff] rounded hover:bg-[#252550] transition-colors duration-300"
                  title="Add Bookmark"
                >
                  +
                </button>
              </div>
            </div>
            
            {filteredBookmarks.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-300">No bookmarks found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : viewMode === 'table' ? (
              // Table view
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#151530]">
                    <tr>
                      <th className="px-4 py-3 text-gray-400">Title</th>
                      <th className="px-4 py-3 text-gray-400">Category</th>
                      <th className="px-4 py-3 text-gray-400 hidden md:table-cell">Last Visited</th>
                      <th className="px-4 py-3 text-gray-400 hidden md:table-cell">Visits</th>
                      <th className="px-4 py-3 text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {filteredBookmarks.map(bookmark => (
                      <tr key={bookmark.id} className="hover:bg-[#151530] transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <a 
                              href={bookmark.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="font-medium text-[#00c3ff] hover:underline"
                              onClick={(e) => {
                                e.preventDefault();
                                openUrl(bookmark.url, bookmark.id);
                              }}
                            >
                              {bookmark.title}
                            </a>
                            <div className="text-xs text-gray-500 truncate" title={bookmark.url}>
                              {bookmark.url}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className="px-2 py-1 text-xs rounded-full" 
                            style={{ 
                              backgroundColor: `${CATEGORY_COLORS[bookmark.category]}20`,
                              color: CATEGORY_COLORS[bookmark.category] 
                            }}
                          >
                            {bookmark.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                          {formatDate(bookmark.lastVisited)}
                        </td>
                        <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                          {bookmark.visitCount}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1">
                            <Link href={`/bookmarks/${bookmark.id}`}>
                              <a className="p-1 text-[#00c3ff] hover:bg-[#00c3ff20] rounded transition-colors" title="View Details">
                                👁️
                              </a>
                            </Link>
                            <button 
                              className="p-1 text-[#39ff14] hover:bg-[#39ff1420] rounded transition-colors" 
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button 
                              className="p-1 text-[#ff1e1e] hover:bg-[#ff1e1e20] rounded transition-colors" 
                              title="Delete"
                              onClick={() => setIsDeleteModalOpen(bookmark.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Grid view
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookmarks.map(bookmark => (
                  <div 
                    key={bookmark.id} 
                    className="relative bg-[#151530] border border-[#333] rounded-lg overflow-hidden hover:shadow-[0_0_10px_rgba(0,195,255,0.2)] transition-all group"
                  >
                    <div className="h-2 w-full" style={{ backgroundColor: CATEGORY_COLORS[bookmark.category] }}></div>
                    <div className="p-4">
                      <div className="mb-2 flex justify-between items-start">
                        <h3 className="font-medium text-[#00c3ff]">{bookmark.title}</h3>
                        <span 
                          className="ml-2 px-2 py-0.5 text-xs rounded-full whitespace-nowrap" 
                          style={{ 
                            backgroundColor: `${CATEGORY_COLORS[bookmark.category]}20`,
                            color: CATEGORY_COLORS[bookmark.category] 
                          }}
                        >
                          {bookmark.category}
                        </span>
                      </div>
                      
                      <div className="mb-3 text-xs text-gray-500 truncate" title={bookmark.url}>
                        {bookmark.url}
                      </div>
                      
                      {bookmark.description && (
                        <p className="mb-3 text-sm text-gray-300 line-clamp-2">{bookmark.description}</p>
                      )}
                      
                      <div className="mb-3 flex flex-wrap gap-1">
                        {bookmark.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="px-2 py-0.5 bg-[#1a1a3a] text-[#39ff14] text-xs rounded-full cursor-pointer hover:bg-[#39ff1420]"
                            onClick={() => toggleTagFilter(tag)}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-400">
                        <div>
                          Last visited: {formatDate(bookmark.lastVisited)}
                        </div>
                        <div>
                          {bookmark.visitCount} visits
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-[#080825] bg-opacity-90 p-1 rounded">
                      <Link href={`/bookmarks/${bookmark.id}`}>
                        <a className="p-1 text-[#00c3ff] hover:bg-[#00c3ff20] rounded transition-colors" title="View Details">
                          👁️
                        </a>
                      </Link>
                      <button 
                        className="p-1 text-[#39ff14] hover:bg-[#39ff1420] rounded transition-colors" 
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="p-1 text-[#ff1e1e] hover:bg-[#ff1e1e20] rounded transition-colors" 
                        title="Delete"
                        onClick={() => setIsDeleteModalOpen(bookmark.id)}
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <button 
                      className="absolute bottom-0 left-0 right-0 p-2 bg-[#00c3ff20] text-[#00c3ff] font-medium text-center hover:bg-[#00c3ff30] transition-colors"
                      onClick={() => openUrl(bookmark.url, bookmark.id)}
                    >
                      Visit Website
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-[#151530] p-6 rounded-lg shadow-2xl border border-[#333] w-full max-w-md">
            <h3 className="text-xl font-bold text-[#ff1e1e] mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this bookmark? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(null)}
                className="px-4 py-2 border border-[#333] text-gray-300 rounded-md hover:bg-[#1a1a3a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBookmark(isDeleteModalOpen)}
                className="px-4 py-2 bg-[#ff1e1e20] text-[#ff1e1e] border border-[#ff1e1e] rounded-md hover:bg-[#ff1e1e30] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Import Modal */}
      {isImportModalOpen && (
        <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      )}
      
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a3a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ListView; 