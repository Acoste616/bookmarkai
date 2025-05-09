import React, { useState, useEffect, useCallback } from 'react';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useToast } from '@/hooks/use-toast';

// Define types
interface Tag {
  id: string;
  name: string;
  count?: number; // Number of bookmarks using this tag
}

const TagsView: React.FC = () => {
  // For toast notifications
  const { toast } = useToast();

  // States for the component
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Load mock data - in a real app, this would come from a store
  useEffect(() => {
    const mockTags: Tag[] = [
      { id: '1', name: 'javascript', count: 15 },
      { id: '2', name: 'react', count: 12 },
      { id: '3', name: 'frontend', count: 10 },
      { id: '4', name: 'css', count: 8 },
      { id: '5', name: 'typescript', count: 7 },
      { id: '6', name: 'api', count: 6 },
      { id: '7', name: 'node', count: 5 },
      { id: '8', name: 'backend', count: 5 },
      { id: '9', name: 'html', count: 4 },
      { id: '10', name: 'database', count: 4 },
      { id: '11', name: 'design', count: 3 },
      { id: '12', name: 'testing', count: 3 },
    ];
    
    setTags(mockTags);
    
    // In a real app, you'd fetch tags from a store:
    // const { bookmarks } = useBookmarkStore();
    // const tagCounts = {};
    // bookmarks.forEach(bookmark => {
    //   bookmark.tags?.forEach(tag => {
    //     tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    //   });
    // });
    // const tagsList = Object.entries(tagCounts).map(([name, count], index) => ({
    //   id: `tag-${index + 1}`,
    //   name,
    //   count,
    // }));
    // setTags(tagsList);
  }, []);

  // Filter tags based on search query
  const filteredTags = useCallback(() => {
    if (!searchQuery.trim()) return tags;
    
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tags, searchQuery]);

  // Sorting function
  const sortedAndFilteredTags = [...filteredTags()].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      const countA = a.count || 0;
      const countB = b.count || 0;
      return sortDirection === 'asc' ? countA - countB : countB - countA;
    }
  });

  // Toggle sort direction or change sort field
  const handleSort = (field: 'name' | 'count') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Reset form and editing states
  const resetForm = () => {
    setNewTagName('');
    setEditingTag(null);
    setIsAdding(false);
  };

  // Handle adding a new tag
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      toast({
        title: 'Error',
        description: 'Tag name cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if tag already exists
    if (tags.some(tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase())) {
      toast({
        title: 'Error',
        description: 'This tag already exists',
        variant: 'destructive',
      });
      return;
    }
    
    // In a real app, you would handle this through a store
    // For now, simulate adding to our local state
    const newId = `tag-${Date.now()}`;
    const tagToAdd = {
      id: newId,
      name: newTagName.trim(),
      count: 0,
    };
    
    setTags([...tags, tagToAdd]);
    
    toast({
      title: 'Success',
      description: `Tag "${newTagName}" added`,
    });
    
    resetForm();
  };

  // Handle updating a tag
  const handleUpdateTag = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTag || !editingTag.name.trim()) {
      toast({
        title: 'Error',
        description: 'Tag name cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if the new name already exists (except for this tag)
    if (tags.some(tag => 
      tag.id !== editingTag.id && 
      tag.name.toLowerCase() === editingTag.name.trim().toLowerCase()
    )) {
      toast({
        title: 'Error',
        description: 'This tag name already exists',
        variant: 'destructive',
      });
      return;
    }
    
    // In a real app, you would handle this through a store
    // For now, simulate updating our local state
    setTags(
      tags.map(tag => 
        tag.id === editingTag.id ? { ...editingTag, name: editingTag.name.trim() } : tag
      )
    );
    
    toast({
      title: 'Success',
      description: `Tag updated successfully`,
    });
    
    resetForm();
  };

  // Handle deleting a tag
  const handleDeleteTag = (id: string) => {
    // In a real app, you would handle this through a store
    // For now, simulate deleting from our local state
    const tagToDelete = tags.find(tag => tag.id === id);
    
    if (!tagToDelete) return;
    
    setTags(tags.filter(tag => tag.id !== id));
    
    toast({
      title: 'Success',
      description: `Tag "${tagToDelete.name}" deleted`,
    });
    
    setIsDeleting(null);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (editingTag) {
      setEditingTag({ ...editingTag, name: value });
    } else {
      setNewTagName(value);
    }
  };

  // Start editing a tag
  const startEdit = (tag: Tag) => {
    setEditingTag(tag);
    setIsAdding(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl bg-[#121212] text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#00c3ff] to-[#ff00aa]">
        Tag Management
      </h1>
      
      {/* Search and Controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-7">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-10 bg-[#1e1e1e] border border-[#333] rounded-md focus:border-[#00c3ff] focus:ring-[#00c3ff] placeholder-gray-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        <div className="md:col-span-3 flex items-center justify-center space-x-3">
          <span className="text-gray-400 text-sm">Sort by:</span>
          <button
            onClick={() => handleSort('name')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === 'name' ? 'bg-[#1e1e1e] text-[#00c3ff]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('count')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === 'count' ? 'bg-[#1e1e1e] text-[#00c3ff]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Usage {sortBy === 'count' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
        
        <div className="md:col-span-2">
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="w-full px-4 py-2 bg-gradient-to-r from-[#00c3ff] to-[#ff00aa] text-white rounded-md hover:opacity-90 transition-all shadow-[0_0_10px_rgba(0,195,255,0.3)]"
          >
            + Add Tag
          </button>
        </div>
      </div>
      
      {/* Form for Adding/Editing Tags */}
      {(isAdding || editingTag) && (
        <div className="mb-6 p-4 border border-[#333] rounded-md bg-[#1e1e1e] shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-[#00c3ff]">
            {editingTag ? 'Edit Tag' : 'Add New Tag'}
          </h2>
          
          <form onSubmit={editingTag ? handleUpdateTag : handleAddTag} className="space-y-4">
            <div>
              <label htmlFor="tagName" className="block text-sm font-medium mb-1 text-gray-300">Tag Name</label>
              <input
                type="text"
                id="tagName"
                value={editingTag ? editingTag.name : newTagName}
                onChange={handleInputChange}
                placeholder="Enter tag name"
                className="w-full p-2 bg-[#2a2a2a] border-2 border-[#444] rounded text-white focus:border-[#00c3ff] focus:ring-[#00c3ff]"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
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
                {editingTag ? 'Update' : 'Add'} Tag
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Tags List */}
      <div className="overflow-hidden border border-[#333] rounded-md bg-[#1e1e1e] shadow-md">
        <div className="grid grid-cols-12 p-4 border-b border-[#333] bg-[#2a2a2a] text-sm font-medium">
          <div className="col-span-7 text-gray-400">Name</div>
          <div className="col-span-2 text-gray-400 text-center">Usage</div>
          <div className="col-span-3 text-gray-400 text-right">Actions</div>
        </div>
        
        {sortedAndFilteredTags.length > 0 ? (
          <div className="divide-y divide-[#333]">
            {sortedAndFilteredTags.map(tag => (
              <div key={tag.id} className="grid grid-cols-12 p-4 items-center hover:bg-[#2a2a2a] transition-colors">
                <div className="col-span-7 font-medium">
                  <span className="px-3 py-1 bg-[#2a2a2a] rounded-full border border-[#444] text-[#39ff14]">
                    {tag.name}
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="px-2 py-1 rounded-full bg-[#2a2a2a] text-sm text-gray-300">
                    {tag.count || 0}
                  </span>
                </div>
                <div className="col-span-3 text-right space-x-2">
                  <button
                    onClick={() => startEdit(tag)}
                    className="px-3 py-1 bg-[#2a2a2a] border border-[#00c3ff] text-[#00c3ff] rounded hover:bg-[#00c3ff20] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setIsDeleting(tag.id)}
                    className="px-3 py-1 bg-[#2a2a2a] border border-[#ff3131] text-[#ff3131] rounded hover:bg-[#ff313120] transition-colors"
                    disabled={Boolean(tag.count && tag.count > 0)}
                    title={tag.count && tag.count > 0 ? "Cannot delete tags in use" : ""}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            {searchQuery ? 'No tags match your search.' : 'No tags found. Create your first tag to get started.'}
          </div>
        )}
      </div>

      {/* Tag Stats */}
      <div className="mt-6 p-4 border border-[#333] rounded-md bg-[#1e1e1e] shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-[#ff00aa]">Tag Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-[#2a2a2a] rounded-md border border-[#333]">
            <div className="text-3xl font-bold text-[#00c3ff]">{tags.length}</div>
            <div className="text-sm text-gray-400">Total Tags</div>
          </div>
          <div className="p-3 bg-[#2a2a2a] rounded-md border border-[#333]">
            <div className="text-3xl font-bold text-[#39ff14]">
              {tags.reduce((sum, tag) => sum + (tag.count || 0), 0)}
            </div>
            <div className="text-sm text-gray-400">Total Usages</div>
          </div>
          <div className="p-3 bg-[#2a2a2a] rounded-md border border-[#333]">
            <div className="text-3xl font-bold text-[#ff00aa]">
              {tags.filter(tag => tag.count && tag.count > 0).length}
            </div>
            <div className="text-sm text-gray-400">Active Tags</div>
          </div>
          <div className="p-3 bg-[#2a2a2a] rounded-md border border-[#333]">
            <div className="text-3xl font-bold text-[#ffea00]">
              {tags.length > 0 
                ? Math.max(...tags.map(tag => tag.count || 0)) 
                : 0}
            </div>
            <div className="text-sm text-gray-400">Most Used</div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-lg border border-[#333] w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-red-500">Confirm Delete</h3>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete this tag? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleting(null)}
                className="px-4 py-2 border border-[#444] rounded-md text-gray-300 hover:bg-[#2a2a2a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTag(isDeleting)}
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

export default TagsView; 