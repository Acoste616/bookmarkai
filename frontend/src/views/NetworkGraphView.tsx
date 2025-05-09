import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from "wouter";
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useToast } from '@/hooks/use-toast';

// Note: ForceGraph2D would be imported from a package (react-force-graph-2d)
// We'll use a placeholder ForceGraph2D component for demonstration
const ForceGraph2D = ({ 
  ref, 
  graphData, 
  nodeLabel, 
  nodeVal, 
  nodeColor, 
  nodeRelSize,
  linkColor,
  linkWidth,
  linkDirectionalParticles,
  linkDirectionalParticleWidth,
  linkDirectionalParticleSpeed,
  linkDirectionalParticleColor,
  backgroundColor,
  onNodeHover,
  onNodeClick,
  cooldownTime,
  nodeCanvasObjectMode,
  nodeCanvasObject,
  linkCanvasObjectMode,
  linkCanvasObject
}) => {
  // This is a placeholder component
  // In a real implementation, react-force-graph-2d would be imported and used
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-[#00c3ff] to-[#ff00aa] mb-4">
          Graph Visualization Placeholder
        </p>
        <p className="text-sm text-gray-400">
          In a real implementation, this would use the react-force-graph-2d package.
        </p>
      </div>
    </div>
  );
};

// Define types
interface GraphNode {
  id: string;
  name: string;
  val: number;
  category: string;
  tags: string[];
}

interface GraphLink {
  source: string;
  target: string;
}

// Neon colors for the Jarvis theme
const NEON_COLORS = {
  blue: 'rgba(0, 195, 255, 1)',
  pink: 'rgba(255, 0, 170, 1)',
  green: 'rgba(57, 255, 20, 1)',
  yellow: 'rgba(255, 234, 0, 1)',
  purple: 'rgba(181, 23, 158, 1)',
  orange: 'rgba(255, 125, 0, 1)',
  red: 'rgba(255, 30, 30, 1)',
  teal: 'rgba(0, 210, 180, 1)',
  gold: 'rgba(255, 215, 0, 1)',
  lime: 'rgba(180, 255, 20, 1)',
  // Cyberpunk neuron colors
  neuronBase: 'rgba(0, 255, 255, 1)',
  neuronGlow: 'rgba(0, 255, 255, 0.6)',
  neuronCore: 'rgba(255, 255, 255, 0.9)',
  edgeColor: 'rgba(136, 255, 255, 0.7)',
  // Glowing variants with lower opacity for effects
  blueGlow: 'rgba(0, 195, 255, 0.7)',
  pinkGlow: 'rgba(255, 0, 170, 0.6)',
  greenGlow: 'rgba(57, 255, 20, 0.6)',
  yellowGlow: 'rgba(255, 234, 0, 0.7)',
};

// Categories for visualization with their neon styles
const CATEGORY_STYLES = {
  'Search Engines': { 
    color: NEON_COLORS.blue, 
    glow: NEON_COLORS.blueGlow,
    coreColor: 'rgba(200, 240, 255, 0.9)'
  },
  'CSS Frameworks': { 
    color: NEON_COLORS.pink, 
    glow: NEON_COLORS.pinkGlow,
    coreColor: 'rgba(255, 220, 240, 0.9)'
  },
  'JavaScript Libraries': { 
    color: NEON_COLORS.green, 
    glow: NEON_COLORS.greenGlow,
    coreColor: 'rgba(220, 255, 220, 0.9)'
  },
  'Development Tools': { 
    color: NEON_COLORS.blue, 
    glow: NEON_COLORS.blueGlow,
    coreColor: 'rgba(200, 240, 255, 0.9)'
  },
  'Documentation': { 
    color: NEON_COLORS.yellow, 
    glow: NEON_COLORS.yellowGlow,
    coreColor: 'rgba(255, 255, 220, 0.9)'
  },
  'AI': { 
    color: NEON_COLORS.teal, 
    glow: NEON_COLORS.tealGlow,
    coreColor: 'rgba(220, 255, 250, 0.9)'
  },
  'Uncategorized': { 
    color: 'rgba(150, 150, 150, 0.8)', 
    glow: 'rgba(150, 150, 150, 0.5)',
    coreColor: 'rgba(220, 220, 220, 0.9)'
  },
};

// Helper function to get category color
const getCategoryColor = (category: string) => {
  return CATEGORY_STYLES[category]?.color || CATEGORY_STYLES['Uncategorized'].color;
};

const NetworkGraphView = () => {
  // States
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pulsePhase, setPulsePhase] = useState<number>(0);
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  
  // In a real app, you'd use these hooks to access the global state
  // const { bookmarks, fetchBookmarks } = useBookmarkStore();
  // const { categories, fetchCategories } = useCategoryStore();

  // Mock data for demonstration
  const MOCK_NODES: GraphNode[] = [
    { id: 'node1', name: 'Google', val: 10, category: 'Search Engines', tags: ['search', 'productivity'] },
    { id: 'node2', name: 'Tailwind CSS', val: 5, category: 'CSS Frameworks', tags: ['styling', 'dev', 'frontend'] },
    { id: 'node3', name: 'React Docs', val: 8, category: 'JavaScript Libraries', tags: ['docs', 'dev', 'frontend'] },
    { id: 'node4', name: 'OpenAI', val: 9, category: 'AI', tags: ['ai', 'ml', 'research'] },
    { id: 'node5', name: 'TypeScript', val: 7, category: 'JavaScript Libraries', tags: ['dev', 'frontend'] },
    { id: 'node6', name: 'GitHub', val: 9, category: 'Development Tools', tags: ['dev', 'productivity'] },
  ];

  const MOCK_LINKS: GraphLink[] = [
    { source: 'node1', target: 'node6' },
    { source: 'node2', target: 'node3' },
    { source: 'node3', target: 'node5' },
    { source: 'node4', target: 'node3' },
    { source: 'node5', target: 'node3' },
    { source: 'node6', target: 'node3' },
  ];

  // Get unique categories and tags from nodes
  const categories = [...new Set(MOCK_NODES.map(node => node.category))];
  const allTags = [...new Set(MOCK_NODES.flatMap(node => node.tags))];

  // Load initial data
  useEffect(() => {
    // Simulate loading data from API
    setTimeout(() => {
      setGraphData({ nodes: MOCK_NODES, links: MOCK_LINKS });
      setIsLoading(false);
      setIsInitialRender(false);
    }, 1000);
    
    // In a real app, you'd fetch data from your store or API
    // fetchBookmarks();
    // fetchCategories();
  }, []);

  // Filter nodes based on search term, selected categories, and tags
  useEffect(() => {
    if (isLoading) return;
    
    let filteredNodes = [...MOCK_NODES];
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredNodes = filteredNodes.filter(node => 
        node.name.toLowerCase().includes(searchLower)
      );
      
      // Highlight nodes that match search
      const matchNodeIds = new Set(
        filteredNodes.map(node => node.id)
      );
      setHighlightNodes(matchNodeIds);
    } else {
      setHighlightNodes(new Set());
    }
    
    // Filter by categories
    if (selectedCategories.length > 0) {
      filteredNodes = filteredNodes.filter(node => 
        selectedCategories.includes(node.category)
      );
    }
    
    // Filter by tags
    if (selectedTags.length > 0) {
      filteredNodes = filteredNodes.filter(node => 
        node.tags?.some(tag => selectedTags.includes(tag))
      );
    }
    
    // Filter links to only include those connecting filtered nodes
    const nodeIds = new Set(filteredNodes.map(node => node.id));
    const filteredLinks = MOCK_LINKS.filter(link => 
      nodeIds.has(link.source as string) && nodeIds.has(link.target as string)
    );
    
    setGraphData({ 
      nodes: filteredNodes,
      links: filteredLinks
    });
  }, [searchTerm, selectedCategories, selectedTags, isLoading]);

  // Handle category filter toggle
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  // Handle tag filter toggle
  const handleTagChange = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const fgRef = useRef<any>();

  // Callback for node hover
  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node ? node.id : null);
  }, []);

  // Handle node click to open details or navigate
  const handleNodeClick = useCallback((node: any) => {
    console.log('Clicked node:', node);
    // In a real app, you'd navigate to the bookmark details page
    // history.push(`/bookmarks/${node.id}`);
    toast({
      title: "Node clicked",
      description: `Clicked on ${node.name}`,
    });
  }, [toast]);

  // Pulsing animation effect for nodes
  useEffect(() => {
    const pulseDuration = 2000; // 2 seconds
    const pulseTimer = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 100); // 0-99 range for smooth pulsing
    }, pulseDuration / 100);
    
    return () => {
      clearInterval(pulseTimer);
    };
  }, []);

  // Function to zoom graph to fit all nodes
  const handleZoomToFit = () => {
    const fg = fgRef.current;
    if (fg && typeof fg.zoomToFit === 'function') {
      fg.zoomToFit(400, 50);
    }
  };

  // Function to toggle fullscreen mode
  const toggleFullscreen = () => {
    const element = document.documentElement;
    
    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };

  // Listen for escape key to exit fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080825] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#00c3ff] border-r-[#00c3ff] border-b-[#ff00aa] border-l-[#ff00aa] border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-[#00c3ff] to-[#ff00aa]">
            Loading graph visualization...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#080825] text-gray-100">
      {/* Sidebar for Filters and Controls */}
      <aside className="w-full md:w-1/4 p-4 space-y-6 bg-[#0a0a2a] border-r border-[#333] overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#00c3ff] to-[#ff00aa]">
            BookmarkBrain
          </h1>
        </div>
        
        {/* Navigation Buttons */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Link href="/list">
            <a className="p-3 bg-[#2a2a2a] border border-[#444] rounded-md flex items-center justify-center hover:border-[#00c3ff] hover:text-[#00c3ff] hover:shadow-[0_0_10px_rgba(0,195,255,0.3)] transition-all duration-300">
              <span className="mr-2">📋</span>
              List View
            </a>
          </Link>
          <Link href="/categories">
            <a className="p-3 bg-[#2a2a2a] border border-[#444] rounded-md flex items-center justify-center hover:border-[#ff00aa] hover:text-[#ff00aa] hover:shadow-[0_0_10px_rgba(255,0,170,0.3)] transition-all duration-300">
              <span className="mr-2">🏷️</span>
              Categories
            </a>
          </Link>
          <Link href="/tags">
            <a className="p-3 bg-[#2a2a2a] border border-[#444] rounded-md flex items-center justify-center hover:border-[#39ff14] hover:text-[#39ff14] hover:shadow-[0_0_10px_rgba(57,255,20,0.3)] transition-all duration-300">
              <span className="mr-2">🔖</span>
              Tags
            </a>
          </Link>
          <Link href="/settings">
            <a className="p-3 bg-[#2a2a2a] border border-[#444] rounded-md flex items-center justify-center hover:border-[#ffea00] hover:text-[#ffea00] hover:shadow-[0_0_10px_rgba(255,234,0,0.3)] transition-all duration-300">
              <span className="mr-2">⚙️</span>
              Settings
            </a>
          </Link>
        </div>
        
        <div className="relative">
          <h2 className="text-xl font-semibold mb-3 text-[#00c3ff]">Search Bookmarks</h2>
          <div className="relative">
            <input 
              type="search"
              placeholder="Search by title, URL, tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-3 pr-10 border-2 border-[#333] rounded-md bg-[#2a2a2a] focus:ring-[#00c3ff] focus:border-[#00c3ff] placeholder-gray-500 transition-all duration-300"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-[#ff00aa]">Filter by Category</h2>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {categories.map(category => (
              <label key={category} className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="form-checkbox h-5 w-5 text-[#ff00aa] rounded border-[#444] focus:ring-[#ff00aa] transition-colors duration-200"
                />
                <span className="group-hover:text-[#ff00aa] transition-colors duration-200"
                  style={{ color: selectedCategories.includes(category) ? getCategoryColor(category) : undefined }}>
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-[#39ff14]">Filter by Tag</h2>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {allTags.map(tag => (
              <label key={tag} className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selectedTags.includes(tag)}
                  onChange={() => handleTagChange(tag)}
                  className="form-checkbox h-5 w-5 text-[#39ff14] rounded border-[#444] focus:ring-[#39ff14] transition-colors duration-200"
                />
                <span className="group-hover:text-[#39ff14] transition-colors duration-200"
                  style={{ color: selectedTags.includes(tag) ? NEON_COLORS.green : undefined }}>
                  {tag}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full mt-6 p-3 bg-gradient-to-r from-[#00c3ff] to-[#ff00aa] text-white rounded-md hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] focus:ring-2 focus:ring-[#00c3ff] shadow-[0_0_15px_rgba(0,195,255,0.5)]"
        >
          Add Bookmark
        </button>
      </aside>

      {/* Main area for Graph */}
      <main className="flex-1 relative bg-gradient-to-br from-[#000020] to-[#000833] backdrop-blur-sm">
        {graphData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 text-6xl">🧠</div>
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#00c3ff] to-[#ff00aa]">
              Welcome to BookmarkBrain
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-xl">
              Your intelligent bookmark management system. Start adding bookmarks to visualize your collection.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#00c3ff] to-[#ff00aa] text-white rounded-md hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] focus:ring-2 focus:ring-[#00c3ff] shadow-[0_0_15px_rgba(0,195,255,0.5)]"
            >
              Add Your First Bookmark
            </button>
          </div>
        ) : (
          <div className="absolute inset-0">
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              nodeLabel="name"
              nodeVal={node => Math.max(6, Math.min(18, node.val * 2))}
              nodeColor={node => getCategoryColor(node.category)}
              nodeRelSize={1}
              linkColor={() => NEON_COLORS.edgeColor}
              linkWidth={1.5}
              linkDirectionalParticles={5}
              linkDirectionalParticleWidth={2.5}
              linkDirectionalParticleSpeed={0.008}
              linkDirectionalParticleColor={link => {
                const sourceNode = graphData.nodes.find(node => node.id === link.source);
                return sourceNode ? getCategoryColor(sourceNode.category) : NEON_COLORS.edgeColor;
              }}
              backgroundColor="transparent"
              onNodeHover={handleNodeHover}
              onNodeClick={handleNodeClick}
              cooldownTime={2000}
              nodeCanvasObjectMode={() => 'replace'}
              nodeCanvasObject={(node, ctx, globalScale) => {
                // This would render a custom node with glow effect
                // Detailed implementation omitted for brevity
              }}
              linkCanvasObjectMode={() => 'replace'}
              linkCanvasObject={(link, ctx, globalScale) => {
                // This would render a custom link with particle flow
                // Detailed implementation omitted for brevity
              }}
            />
          </div>
        )}
        
        {/* Floating Action Menu */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 p-2 backdrop-blur-md bg-black/40 border border-[#333] rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-3 bg-gradient-to-r from-[#00c3ff] to-[#ff00aa] text-white rounded-full hover:opacity-90 transition-all duration-300 shadow-[0_0_10px_rgba(0,195,255,0.5)]"
            title="Add Bookmark"
          >
            +
          </button>
          
          <button
            onClick={handleZoomToFit}
            className="p-3 bg-[#2a2a2a] text-[#39ff14] rounded-full hover:bg-[#39ff1420] transition-colors duration-300 border border-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.3)]"
            title="Zoom to Fit"
          >
            🔍
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-3 bg-[#2a2a2a] text-[#ffea00] rounded-full hover:bg-[#ffea0020] transition-colors duration-300 border border-[#ffea00] shadow-[0_0_10px_rgba(255,234,0,0.3)]"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? "❌" : "⛶"}
          </button>
        </div>
      </main>

      {/* Add Bookmark Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-[0_0_25px_rgba(0,195,255,0.5)] border border-[#333] w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-[#00c3ff]">Add New Bookmark</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-gray-400 hover:text-white hover:bg-[#333] rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200"
              >
                &times;
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium mb-1 text-gray-300">URL</label>
                <input 
                  type="url" 
                  id="url" 
                  name="url" 
                  placeholder="https://example.com"
                  className="w-full p-2 border-2 border-[#333] rounded-md bg-[#2a2a2a] focus:ring-[#00c3ff] focus:border-[#00c3ff] text-white transition-colors duration-200" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1 text-gray-300">Title (Optional)</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  placeholder="My Awesome Website"
                  className="w-full p-2 border-2 border-[#333] rounded-md bg-[#2a2a2a] focus:ring-[#ff00aa] focus:border-[#ff00aa] text-white transition-colors duration-200" 
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1 text-gray-300">Category</label>
                <select 
                  id="category" 
                  name="category" 
                  className="w-full p-2 border-2 border-[#333] rounded-md bg-[#2a2a2a] focus:ring-[#00c3ff] focus:border-[#00c3ff] text-white transition-colors duration-200"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="tags" className="block text-sm font-medium mb-1 text-gray-300">Tags (comma separated)</label>
                <input 
                  type="text" 
                  id="tags" 
                  name="tags" 
                  placeholder="productivity, dev, docs"
                  className="w-full p-2 border-2 border-[#333] rounded-md bg-[#2a2a2a] focus:ring-[#39ff14] focus:border-[#39ff14] text-white transition-colors duration-200" 
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-300">Description (Optional)</label>
                <textarea 
                  id="description" 
                  name="description" 
                  rows={2}
                  placeholder="A brief description of the website..."
                  className="w-full p-2 border-2 border-[#333] rounded-md bg-[#2a2a2a] focus:ring-[#00c3ff] focus:border-[#00c3ff] text-white transition-colors duration-200" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full mt-6 p-3 bg-gradient-to-r from-[#00c3ff] to-[#ff00aa] text-white rounded-md hover:opacity-90 transition-all duration-300 shadow-[0_0_15px_rgba(0,195,255,0.3)]"
              >
                Save Bookmark
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom CSS for scrollbar and other effects */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2a2a2a;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        /* Gradient text effect */
        .gradient-text {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          background-image: linear-gradient(to right, #00c3ff, #ff00aa);
        }
        
        /* Neon glow effects */
        .neon-blue {
          box-shadow: 0 0 10px #00c3ff, 0 0 20px #00c3ff;
        }
        .neon-pink {
          box-shadow: 0 0 10px #ff00aa, 0 0 20px #ff00aa;
        }
        .neon-green {
          box-shadow: 0 0 10px #39ff14, 0 0 20px #39ff14;
        }
      `}</style>
    </div>
  );
};

export default NetworkGraphView; 