import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Define types
interface AIAnalysis {
  id: string;
  bookmarkId: string;
  summary: string;
  timestamp: Date;
}

interface RelatedBookmark {
  id: string;
  title: string;
  url: string;
  similarity: number; // 0-1 score of how related it is
}

const BookmarkDetailView: React.FC = () => {
  // Get bookmark ID from URL
  const [, params] = useRoute<{ id: string }>('/bookmarks/:id');
  const bookmarkId = params?.id;
  const { toast } = useToast();

  // State for bookmark data
  const [bookmark, setBookmark] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // State for AI analysis
  const [aiAnalyses, setAiAnalyses] = useState<AIAnalysis[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // State for related bookmarks
  const [relatedBookmarks, setRelatedBookmarks] = useState<RelatedBookmark[]>([]);

  // Get store data
  const { updateBookmark } = useBookmarkStore();
  const { categories } = useCategoryStore();

  // Load bookmark data
  useEffect(() => {
    const fetchBookmarkDetails = async () => {
      if (!bookmarkId) return;
      
      setLoading(true);
      try {
        // In a real app, you'd fetch this from your API
        // const response = await api.get(`/bookmarks/${bookmarkId}`);
        // const data = response.data;
        
        // For now, mocking the data
        const mockBookmark = {
          id: bookmarkId,
          title: 'Example Bookmark',
          url: 'https://example.com/page',
          description: 'This is an example bookmark description.',
          categoryId: 'category1',
          tags: ['programming', 'react', 'typescript'],
          createdAt: new Date('2023-06-15T14:30:00'),
          updatedAt: new Date('2023-06-15T14:30:00'),
        };
        
        const mockAiAnalyses = [
          {
            id: 'analysis1',
            bookmarkId,
            summary: 'This page contains information about web development best practices and React hooks.',
            timestamp: new Date('2023-06-15T15:00:00'),
          },
          {
            id: 'analysis2',
            bookmarkId,
            summary: 'Documentation about TypeScript interfaces and type definitions with examples.',
            timestamp: new Date('2023-06-16T10:15:00'),
          },
        ];
        
        const mockRelatedBookmarks = [
          {
            id: 'rel1',
            title: 'React Documentation',
            url: 'https://reactjs.org/docs',
            similarity: 0.85,
          },
          {
            id: 'rel2',
            title: 'TypeScript Handbook',
            url: 'https://www.typescriptlang.org/docs/',
            similarity: 0.75,
          },
          {
            id: 'rel3',
            title: 'MDN Web Docs',
            url: 'https://developer.mozilla.org',
            similarity: 0.65,
          },
        ];
        
        // Set state with mock data
        setBookmark(mockBookmark);
        setSelectedCategory(mockBookmark.categoryId);
        setSelectedTags(mockBookmark.tags || []);
        setAiAnalyses(mockAiAnalyses);
        setRelatedBookmarks(mockRelatedBookmarks);
        
        // All available tags (would normally come from an API)
        setAvailableTags(['programming', 'react', 'typescript', 'javascript', 'web', 'css', 'html', 'api', 'backend', 'frontend']);
      } catch (error) {
        console.error('Error fetching bookmark details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bookmark details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookmarkDetails();
  }, [bookmarkId, toast]);

  // Handle category change
  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategoryId = e.target.value;
    setSelectedCategory(newCategoryId);
    
    if (bookmark) {
      try {
        // In a real app, you'd update via API
        // await updateBookmark({ ...bookmark, categoryId: newCategoryId });
        toast({
          title: 'Success',
          description: 'Category updated successfully.',
        });
      } catch (error) {
        console.error('Error updating category:', error);
        toast({
          title: 'Error',
          description: 'Failed to update category.',
          variant: 'destructive',
        });
      }
    }
  };
  
  // Handle tag operations
  const handleAddTag = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      const updatedTags = [...selectedTags, newTag];
      setSelectedTags(updatedTags);
      setNewTag('');
      
      // In a real app, you'd update via API
      // updateBookmark({ ...bookmark, tags: updatedTags });
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(updatedTags);
    
    // In a real app, you'd update via API
    // updateBookmark({ ...bookmark, tags: updatedTags });
  };
  
  const handleTagSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTag = e.target.value;
    if (selectedTag && !selectedTags.includes(selectedTag)) {
      const updatedTags = [...selectedTags, selectedTag];
      setSelectedTags(updatedTags);
      
      // In a real app, you'd update via API
      // updateBookmark({ ...bookmark, tags: updatedTags });
    }
  };
  
  // Handle AI analysis
  const handleGenerateAnalysis = async () => {
    if (!bookmark) return;
    
    setIsAnalyzing(true);
    try {
      // In a real app, you'd make an API call
      // const response = await api.post('/api/ai/query', { url: bookmark.url });
      // const analysis = response.data.analysis;
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockAnalysis = 'This page appears to be a technical documentation about React hooks and state management. It covers topics like useState, useEffect, and context API with practical examples. The content is best suited for intermediate React developers looking to deepen their understanding of functional components.';
      
      setCurrentAnalysis(mockAnalysis);
      
      // Add to analyses history
      const newAnalysis = {
        id: `analysis${aiAnalyses.length + 1}`,
        bookmarkId: bookmark.id,
        summary: mockAnalysis,
        timestamp: new Date(),
      };
      
      setAiAnalyses(prev => [newAnalysis, ...prev]);
      
      toast({
        title: 'Analysis Complete',
        description: 'AI has analyzed the bookmark content.',
      });
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to generate AI analysis.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle re-using a previous analysis
  const handleUseAnalysis = (analysis: AIAnalysis) => {
    setCurrentAnalysis(analysis.summary);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
          <div className="h-32 bg-gray-200 rounded w-full mb-6"></div>
          <div className="h-24 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!bookmark) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-red-500">Bookmark not found</h1>
        <p>The bookmark you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl bg-[#121212] text-gray-100 min-h-screen">
      {/* Bookmark Title and URL */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#00c3ff] to-[#ff00aa]">
          {bookmark.title}
        </h1>
        <a 
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer" 
          className="text-[#39ff14] hover:text-[#66ff66] underline transition-colors"
        >
          {bookmark.url}
        </a>
        <p className="text-gray-400 mt-1">
          Added on {new Date(bookmark.createdAt).toLocaleDateString()}
        </p>
      </div>
      
      {/* Current AI Analysis (if available) */}
      {currentAnalysis && (
        <div className="mb-8 p-4 border border-[#333] rounded-md bg-[#1e1e1e] shadow-[0_0_10px_rgba(0,195,255,0.2)]">
          <h2 className="text-xl font-semibold mb-2 text-[#00c3ff]">AI Summary</h2>
          <p className="text-gray-200 leading-relaxed">{currentAnalysis}</p>
        </div>
      )}
      
      {/* Category and Tags Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 border border-[#333] rounded-md bg-[#1e1e1e]">
          <h2 className="text-xl font-semibold mb-4 text-[#ff00aa]">Category</h2>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full p-2 bg-[#2a2a2a] border-2 border-[#444] rounded text-white focus:border-[#ff00aa] focus:ring-[#ff00aa]"
          >
            <option value="">Select a category</option>
            {categories?.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            )) || (
              // Mock categories if real ones aren't available
              <>
                <option value="category1">Development</option>
                <option value="category2">Design</option>
                <option value="category3">Marketing</option>
                <option value="category4">Business</option>
                <option value="category5">Personal</option>
              </>
            )}
          </select>
        </div>
        
        <div className="p-4 border border-[#333] rounded-md bg-[#1e1e1e]">
          <h2 className="text-xl font-semibold mb-4 text-[#39ff14]">Tags</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedTags.map(tag => (
              <span 
                key={tag} 
                className="px-3 py-1 bg-[#2a2a2a] text-[#39ff14] rounded-full flex items-center"
              >
                {tag}
                <button 
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value=""
              onChange={handleTagSelect}
              className="flex-grow p-2 bg-[#2a2a2a] border-2 border-[#444] rounded text-white focus:border-[#39ff14] focus:ring-[#39ff14]"
            >
              <option value="">Select a tag</option>
              {availableTags
                .filter(tag => !selectedTags.includes(tag))
                .map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))
              }
            </select>
            <span className="text-gray-400">or</span>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="New tag..."
              className="flex-grow p-2 bg-[#2a2a2a] border-2 border-[#444] rounded text-white focus:border-[#39ff14] focus:ring-[#39ff14]"
            />
            <button
              onClick={handleAddTag}
              disabled={!newTag}
              className="px-4 py-2 bg-[#2a2a2a] text-[#39ff14] border border-[#39ff14] rounded hover:bg-[#39ff14] hover:text-[#121212] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      </div>
      
      {/* AI Analysis Button */}
      <div className="mb-8">
        <button
          onClick={handleGenerateAnalysis}
          disabled={isAnalyzing}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#00c3ff] to-[#ff00aa] text-white rounded-md hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,195,255,0.3)]"
        >
          {isAnalyzing ? 'Analyzing with AI...' : 'Analyze with AI'}
        </button>
      </div>
      
      {/* AI History Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[#00c3ff]">AI Analysis History</h2>
        {aiAnalyses.length > 0 ? (
          <div className="space-y-4">
            {aiAnalyses.map(analysis => (
              <div key={analysis.id} className="p-4 border border-[#333] rounded-md bg-[#1e1e1e] hover:border-[#00c3ff] transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-gray-400 text-sm">
                    {new Date(analysis.timestamp).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleUseAnalysis(analysis)}
                    className="text-[#00c3ff] hover:text-[#66ccff] text-sm"
                  >
                    Use This Analysis
                  </button>
                </div>
                <p className="text-gray-200">{analysis.summary}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No AI analyses yet. Click "Analyze with AI" to generate one.</p>
        )}
      </div>
      
      {/* Related Bookmarks Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[#ff00aa]">Related Bookmarks</h2>
        {relatedBookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedBookmarks.map(related => (
              <a
                key={related.id}
                href={`/bookmarks/${related.id}`}
                className="p-4 border border-[#333] rounded-md bg-[#1e1e1e] hover:border-[#ff00aa] transition-all hover:shadow-[0_0_10px_rgba(255,0,170,0.3)] block"
              >
                <h3 className="font-semibold text-white mb-1">{related.title}</h3>
                <p className="text-gray-400 text-sm truncate">{related.url}</p>
                <div className="mt-2 flex items-center">
                  <div className="h-1 bg-[#2a2a2a] rounded-full flex-grow">
                    <div 
                      className="h-1 bg-gradient-to-r from-[#ff00aa] to-[#00c3ff] rounded-full" 
                      style={{ width: `${related.similarity * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">{Math.round(related.similarity * 100)}% match</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No related bookmarks found.</p>
        )}
      </div>
      
      {/* Description Section (if available) */}
      {bookmark.description && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-[#39ff14]">Description</h2>
          <div className="p-4 border border-[#333] rounded-md bg-[#1e1e1e]">
            <p className="text-gray-200">{bookmark.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkDetailView; 