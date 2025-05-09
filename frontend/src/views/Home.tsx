import React, { useState, useCallback, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d'; // Direct import from 2D package
import { Link } from "wouter";
// import { useBookmarkStore } from '@/stores/bookmarkStore';
// import { useCategoryStore } from '@/stores/categoryStore';

// Placeholder data - replace with actual data from stores
const MOCK_NODES = [
  { id: 'node1', name: 'Google', val: 10, category: 'Search Engines', tags: ['search', 'productivity'] },
  { id: 'node2', name: 'Tailwind CSS', val: 5, category: 'CSS Frameworks', tags: ['styling', 'dev', 'frontend'] },
  { id: 'node3', name: 'React Docs', val: 8, category: 'JavaScript Libraries', tags: ['docs', 'dev', 'frontend'] },
  { id: 'node4', name: 'Vite', val: 6, category: 'Build Tools', tags: ['dev', 'frontend'] },
  { id: 'node5', name: 'TypeScript', val: 7, category: 'JavaScript Libraries', tags: ['dev', 'frontend'] },
  { id: 'node6', name: 'GitHub', val: 9, category: 'Development Tools', tags: ['dev', 'productivity'] },
  { id: 'node7', name: 'VS Code', val: 8, category: 'Development Tools', tags: ['dev', 'productivity'] },
  { id: 'node8', name: 'MDN Web Docs', val: 7, category: 'Documentation', tags: ['docs', 'dev'] },
  // AI category
  { id: 'node9', name: 'OpenAI', val: 9, category: 'AI', tags: ['ai', 'ml', 'research'] },
  { id: 'node10', name: 'Hugging Face', val: 7, category: 'AI', tags: ['ai', 'ml', 'transformers'] },
  { id: 'node11', name: 'TensorFlow', val: 8, category: 'AI', tags: ['ai', 'ml', 'framework'] },
  // FUN category
  { id: 'node12', name: 'Reddit', val: 8, category: 'FUN', tags: ['social', 'entertainment'] },
  { id: 'node13', name: 'YouTube', val: 10, category: 'FUN', tags: ['video', 'entertainment'] },
  { id: 'node14', name: 'Spotify', val: 7, category: 'FUN', tags: ['music', 'entertainment'] },
  // Rozwoj osobisty (Personal Development)
  { id: 'node15', name: 'Coursera', val: 8, category: 'Rozwoj osobisty', tags: ['learning', 'courses'] },
  { id: 'node16', name: 'Goodreads', val: 6, category: 'Rozwoj osobisty', tags: ['books', 'reading'] },
  { id: 'node17', name: 'Blinkist', val: 5, category: 'Rozwoj osobisty', tags: ['books', 'summaries'] },
  // Sport
  { id: 'node18', name: 'ESPN', val: 7, category: 'Sport', tags: ['news', 'sports'] },
  { id: 'node19', name: 'Strava', val: 6, category: 'Sport', tags: ['fitness', 'tracking'] },
  { id: 'node20', name: 'FIFA', val: 7, category: 'Sport', tags: ['football', 'soccer'] },
  // Newsy (News)
  { id: 'node21', name: 'CNN', val: 7, category: 'Newsy', tags: ['news', 'media'] },
  { id: 'node22', name: 'BBC', val: 7, category: 'Newsy', tags: ['news', 'media'] },
  { id: 'node23', name: 'The Guardian', val: 6, category: 'Newsy', tags: ['news', 'media'] },
  // Tesla
  { id: 'node24', name: 'Tesla.com', val: 8, category: 'Tesla', tags: ['cars', 'ev', 'technology'] },
  { id: 'node25', name: 'Tesla Investors', val: 7, category: 'Tesla', tags: ['stocks', 'finance'] },
  { id: 'node26', name: 'Electrek', val: 6, category: 'Tesla', tags: ['news', 'ev', 'technology'] },
  // Filmy (Movies)
  { id: 'node27', name: 'IMDB', val: 8, category: 'Filmy', tags: ['movies', 'ratings'] },
  { id: 'node28', name: 'Netflix', val: 9, category: 'Filmy', tags: ['streaming', 'entertainment'] },
  { id: 'node29', name: 'Letterboxd', val: 6, category: 'Filmy', tags: ['movies', 'reviews'] },
  // Biznes (Business)
  { id: 'node30', name: 'LinkedIn', val: 8, category: 'Biznes', tags: ['networking', 'professional'] },
  { id: 'node31', name: 'Bloomberg', val: 7, category: 'Biznes', tags: ['finance', 'news'] },
  { id: 'node32', name: 'Wall Street Journal', val: 7, category: 'Biznes', tags: ['finance', 'news'] },
];

const MOCK_LINKS = [
  { source: 'node1', target: 'node6' },
  { source: 'node2', target: 'node3' },
  { source: 'node3', target: 'node5' },
  { source: 'node4', target: 'node2' },
  { source: 'node5', target: 'node3' },
  { source: 'node6', target: 'node7' },
  { source: 'node7', target: 'node8' },
  { source: 'node8', target: 'node1' },
  // AI links
  { source: 'node9', target: 'node10' },
  { source: 'node10', target: 'node11' },
  { source: 'node9', target: 'node11' },
  // FUN links
  { source: 'node12', target: 'node13' },
  { source: 'node13', target: 'node14' },
  { source: 'node12', target: 'node14' },
  // Rozwoj osobisty links
  { source: 'node15', target: 'node16' },
  { source: 'node16', target: 'node17' },
  { source: 'node15', target: 'node17' },
  // Sport links
  { source: 'node18', target: 'node19' },
  { source: 'node19', target: 'node20' },
  { source: 'node18', target: 'node20' },
  // Newsy links
  { source: 'node21', target: 'node22' },
  { source: 'node22', target: 'node23' },
  { source: 'node21', target: 'node23' },
  // Tesla links
  { source: 'node24', target: 'node25' },
  { source: 'node25', target: 'node26' },
  { source: 'node24', target: 'node26' },
  // Filmy links
  { source: 'node27', target: 'node28' },
  { source: 'node28', target: 'node29' },
  { source: 'node27', target: 'node29' },
  // Biznes links
  { source: 'node30', target: 'node31' },
  { source: 'node31', target: 'node32' },
  { source: 'node30', target: 'node32' },
  // Cross-category links for more interesting visualization
  { source: 'node9', target: 'node6' },  // AI - Development Tools
  { source: 'node13', target: 'node27' }, // FUN - Filmy
  { source: 'node15', target: 'node30' }, // Rozwoj osobisty - Biznes
  { source: 'node24', target: 'node31' }, // Tesla - Biznes
  { source: 'node21', target: 'node18' }, // Newsy - Sport
];

const MOCK_CATEGORIES = [
  'Search Engines', 
  'CSS Frameworks', 
  'JavaScript Libraries', 
  'Build Tools', 
  'Development Tools', 
  'Documentation', 
  'AI',
  'FUN',
  'Rozwoj osobisty', 
  'Sport',
  'Newsy',
  'Tesla',
  'Filmy',
  'Biznes',
  'Uncategorized'
];

const MOCK_TAGS = [
  'productivity', 
  'dev', 
  'docs', 
  'styling', 
  'frontend', 
  'search', 
  'ai', 
  'ml', 
  'entertainment', 
  'learning',
  'sports',
  'news',
  'technology',
  'movies',
  'finance'
];

// Define neon colors for the Jarvis theme
const NEON_COLORS = {
  blue: 'rgba(0, 195, 255, 1)',     // Primary neon blue
  pink: 'rgba(255, 0, 170, 1)',      // Secondary neon pink 
  green: 'rgba(57, 255, 20, 1)',     // Green accent
  yellow: 'rgba(255, 234, 0, 1)',    // Yellow for highlighted items
  purple: 'rgba(181, 23, 158, 1)',   // Purple accent
  orange: 'rgba(255, 125, 0, 1)',    // Orange accent
  red: 'rgba(255, 30, 30, 1)',       // Red accent
  teal: 'rgba(0, 210, 180, 1)',      // Teal accent
  gold: 'rgba(255, 215, 0, 1)',      // Gold accent
  lime: 'rgba(180, 255, 20, 1)',     // Lime accent
  // Cyberpunk neuron colors
  neuronBase: 'rgba(0, 255, 255, 1)',  // Neon cyan
  neuronGlow: 'rgba(0, 255, 255, 0.6)', // Softer cyan glow
  neuronCore: 'rgba(255, 255, 255, 0.9)', // White center
  edgeColor: 'rgba(136, 255, 255, 0.7)', // Increased opacity for edges
  // Glowing variants with lower opacity for effects
  blueGlow: 'rgba(0, 195, 255, 0.7)',
  pinkGlow: 'rgba(255, 0, 170, 0.6)',
  greenGlow: 'rgba(57, 255, 20, 0.6)',
  yellowGlow: 'rgba(255, 234, 0, 0.7)',
  purpleGlow: 'rgba(181, 23, 158, 0.6)',
  orangeGlow: 'rgba(255, 125, 0, 0.6)',
  redGlow: 'rgba(255, 30, 30, 0.6)',
  tealGlow: 'rgba(0, 210, 180, 0.6)',
  goldGlow: 'rgba(255, 215, 0, 0.6)',
  limeGlow: 'rgba(180, 255, 20, 0.6)',
};

// Helper function to get color and glow for a category in cyberpunk style
const getCategoryNeonStyle = (category: string) => {
  const styles: Record<string, { color: string, glow: string, coreColor: string }> = {
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
    'Build Tools': { 
      color: NEON_COLORS.purple, 
      glow: NEON_COLORS.purpleGlow,
      coreColor: 'rgba(240, 220, 255, 0.9)'
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
    // New categories with their neon styles
    'AI': { 
      color: NEON_COLORS.teal, 
      glow: NEON_COLORS.tealGlow,
      coreColor: 'rgba(220, 255, 250, 0.9)'
    },
    'FUN': { 
      color: NEON_COLORS.pink, 
      glow: NEON_COLORS.pinkGlow,
      coreColor: 'rgba(255, 220, 240, 0.9)'
    },
    'Rozwoj osobisty': { 
      color: NEON_COLORS.lime, 
      glow: NEON_COLORS.limeGlow,
      coreColor: 'rgba(240, 255, 220, 0.9)'
    },
    'Sport': { 
      color: NEON_COLORS.green, 
      glow: NEON_COLORS.greenGlow,
      coreColor: 'rgba(220, 255, 220, 0.9)'
    },
    'Newsy': { 
      color: NEON_COLORS.orange, 
      glow: NEON_COLORS.orangeGlow,
      coreColor: 'rgba(255, 240, 220, 0.9)'
    },
    'Tesla': { 
      color: NEON_COLORS.red, 
      glow: NEON_COLORS.redGlow,
      coreColor: 'rgba(255, 220, 220, 0.9)'
    },
    'Filmy': { 
      color: NEON_COLORS.gold, 
      glow: NEON_COLORS.goldGlow,
      coreColor: 'rgba(255, 250, 220, 0.9)'
    },
    'Biznes': { 
      color: NEON_COLORS.blue, 
      glow: NEON_COLORS.blueGlow,
      coreColor: 'rgba(220, 240, 255, 0.9)'
    },
    'Uncategorized': { 
      color: 'rgba(150, 150, 150, 0.8)', 
      glow: 'rgba(150, 150, 150, 0.5)',
      coreColor: 'rgba(220, 220, 220, 0.9)'
    },
  };
  
  return styles[category] || styles['Uncategorized'];
};

// Helper function to get color for a category
const getCategoryColor = (category: string) => {
  const categoryColorMap: Record<string, string> = {
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
    'Uncategorized': 'rgba(150, 150, 150, 0.8)',
  };
  return categoryColorMap[category] || 'rgba(150, 150, 150, 0.8)';
};

const Home: React.FC = () => {
  const [graphData, setGraphData] = useState({ nodes: MOCK_NODES, links: MOCK_LINKS });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pulsePhase, setPulsePhase] = useState<number>(0);
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true);
  
  // const { bookmarks, fetchBookmarks } = useBookmarkStore();
  // const { categories, fetchCategories } = useCategoryStore();

  // useEffect(() => {
  //   fetchBookmarks();
  //   fetchCategories();
  // }, [fetchBookmarks, fetchCategories]);

  // Filter nodes based on search term, selected categories, and tags
  useEffect(() => {
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
  }, [searchTerm, selectedCategories, selectedTags]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

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
    // Here you would typically open a modal with bookmark details
    // or navigate to the bookmark URL
    window.open(`https://${node.name.toLowerCase().replace(/\s+/g, '')}.com`, '_blank');
  }, []);

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
  
  // Initial animation effect
  useEffect(() => {
    if (isInitialRender) {
      // Set timeout to disable initial render animation after 1.5 seconds
      const timer = setTimeout(() => {
        setIsInitialRender(false);
      }, 1500);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isInitialRender]);

  // Effect to adjust graph camera on component mount
  useEffect(() => {
    const fg = fgRef.current;
    if (fg) {
      // Handle initial animation in a different way
      if (isInitialRender) {
        // We'll use an alternative approach to position nodes
        // by directly manipulating the state instead
        const initialNodes = MOCK_NODES.map(node => ({
          ...node,
          x: 0,  // Start all nodes at center
          y: 0
        }));
        
        setGraphData({
          nodes: initialNodes,
          links: MOCK_LINKS
        });
      }
      
      // Zoom to fit all nodes
      setTimeout(() => {
        if (fg && typeof fg.zoomToFit === 'function') {
          fg.zoomToFit(400, 50);
        }
      }, 500);
    }
  }, [isInitialRender]);

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

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#080825] text-gray-100 neuron-graph-container">
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
            {MOCK_CATEGORIES.map(category => (
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
            {MOCK_TAGS.map(tag => (
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
              nodeVal={node => Math.max(6, Math.min(18, node.val * 2))} // Slightly larger nodes for better visibility
              nodeColor={node => getCategoryNeonStyle(node.category).color} // Use category color
              nodeRelSize={1} // Base size multiplier
              linkColor={() => NEON_COLORS.edgeColor}
              linkWidth={1.5} // Thicker lines for better visibility
              linkDirectionalParticles={5} // More particles for better visibility
              linkDirectionalParticleWidth={2.5} // Larger particles
              linkDirectionalParticleSpeed={0.008} // Slightly slower for better visibility
              linkDirectionalParticleColor={link => {
                // Get source node's category color for the particles
                const sourceNode = graphData.nodes.find(node => node.id === link.source);
                return sourceNode ? getCategoryNeonStyle(sourceNode.category).color : NEON_COLORS.edgeColor;
              }}
              backgroundColor="transparent"
              onNodeHover={handleNodeHover}
              onNodeClick={handleNodeClick}
              cooldownTime={2000} // Shorter cooldown for faster responsiveness
              nodeCanvasObjectMode={() => 'replace'} // Replace default node rendering
              nodeCanvasObject={(node, ctx, globalScale) => {
                // Safety check for valid coordinates
                if (!node || !isFinite(node.x) || !isFinite(node.y)) {
                  return; // Skip rendering if coordinates are invalid
                }
                
                const label = node.name;
                const size = Math.max(4, Math.min(14, node.val * 2)) / globalScale; // Smaller nodes
                const fontSize = 10/globalScale; // Slightly smaller font
                const isHovered = node.id === hoveredNode;
                const isHighlighted = highlightNodes.size > 0 && highlightNodes.has(node.id as string);
                const showLabel = isHovered || isHighlighted;
                
                // Get category-specific styling
                const categoryStyle = getCategoryNeonStyle(node.category);
                
                // Calculate pulse effect (0-1 range for glow intensity)
                const pulseIntensity = Math.sin(pulsePhase * Math.PI / 50) * 0.2 + 0.8;
                
                // Initial animation scaling factor (0 to 1)
                const initialScale = isInitialRender 
                  ? Math.min(1, Date.now() % 1500 / 1000) 
                  : 1;
                
                // Scale up when hovered
                const hoverScale = isHovered ? 1.3 : 1;
                
                // Calculate actual radius with all effects applied
                const radius = size * hoverScale * initialScale;
                
                // Safety check for valid radius
                if (!isFinite(radius) || radius <= 0) {
                  return; // Skip rendering if radius is invalid
                }
                
                // Save context state
                ctx.save();
                
                try {
                  // Draw outer glow
                  const glowSize = radius * (1 + 0.5 * pulseIntensity);
                  const glowGradient = ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, glowSize
                  );
                  
                  // Add pulsing glow effect with category color
                  glowGradient.addColorStop(0, isHovered || isHighlighted 
                    ? 'rgba(255, 255, 255, 0.9)' // Brighter core when hovered/highlighted
                    : categoryStyle.coreColor);
                  glowGradient.addColorStop(0.5, isHovered || isHighlighted
                    ? categoryStyle.color // Full color when hovered
                    : `rgba(${categoryStyle.color.match(/\d+/g)?.slice(0,3).join(', ')}, ${0.7 * pulseIntensity})`);
                  glowGradient.addColorStop(1, `rgba(${categoryStyle.color.match(/\d+/g)?.slice(0,3).join(', ')}, ${0.1 * pulseIntensity})`);
                  
                  // Apply glow
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, glowSize, 0, 2 * Math.PI);
                  ctx.fillStyle = glowGradient;
                  ctx.fill();
                  
                  // Draw node base
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                  
                  // Create radial gradient for node with category color
                  const nodeGradient = ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, radius
                  );
                  nodeGradient.addColorStop(0, categoryStyle.coreColor); // White/light core
                  nodeGradient.addColorStop(0.6, categoryStyle.color); // Category color edge
                  nodeGradient.addColorStop(1, `rgba(${categoryStyle.color.match(/\d+/g)?.slice(0,3).join(', ')}, 0.1)`); // Fade out
                  
                  ctx.fillStyle = nodeGradient;
                  ctx.fill();
                  
                  // Draw outline
                  ctx.strokeStyle = isHovered 
                    ? 'rgba(255, 255, 255, 0.9)' // White for hover
                    : `rgba(${categoryStyle.color.match(/\d+/g)?.slice(0,3).join(', ')}, 0.8)`; // Category color
                  ctx.lineWidth = isHovered ? 1.5/globalScale : 0.8/globalScale; // Thinner outline
                  ctx.stroke();
                  
                  // Draw label if hovered or highlighted
                  if (showLabel && label) {
                    // Set font before measuring text
                    ctx.font = `${fontSize}px Arial, sans-serif`;
                    
                    // Background for text
                    const textWidth = ctx.measureText(label).width;
                    if (isFinite(textWidth)) {
                      const bckgDimensions = [textWidth + 10, fontSize + 6].map(n => n/globalScale);
                      
                      // Calculate positions for the label backdrop
                      const boxX = node.x - bckgDimensions[0]/2;
                      const boxY = node.y - radius - bckgDimensions[1] - 6/globalScale;
                      const boxWidth = bckgDimensions[0];
                      const boxHeight = bckgDimensions[1];
                      const boxRadius = 3/globalScale;
                      
                      // Skip drawing label if any dimension is invalid
                      if (isFinite(boxX) && isFinite(boxY) && isFinite(boxWidth) && isFinite(boxHeight)) {
                        // Draw a rounded rectangle backdrop
                        ctx.beginPath();
                        ctx.moveTo(boxX + boxRadius, boxY);
                        ctx.lineTo(boxX + boxWidth - boxRadius, boxY);
                        ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + boxRadius);
                        ctx.lineTo(boxX + boxWidth, boxY + boxHeight - boxRadius);
                        ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - boxRadius, boxY + boxHeight);
                        ctx.lineTo(boxX + boxRadius, boxY + boxHeight);
                        ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - boxRadius);
                        ctx.lineTo(boxX, boxY + boxRadius);
                        ctx.quadraticCurveTo(boxX, boxY, boxX + boxRadius, boxY);
                        ctx.closePath();
                        
                        // Fill with color-matched background
                        ctx.fillStyle = `rgba(0, 10, 30, 0.85)`;
                        ctx.fill();
                        ctx.strokeStyle = categoryStyle.color;
                        ctx.lineWidth = 0.8/globalScale;
                        ctx.stroke();
                        
                        // Draw label text
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(label, node.x, boxY + boxHeight/2);
                        
                        // Add a connecting line from label to node
                        ctx.beginPath();
                        ctx.moveTo(node.x, boxY + boxHeight);
                        ctx.lineTo(node.x, node.y - radius);
                        ctx.strokeStyle = `rgba(${categoryStyle.color.match(/\d+/g)?.slice(0,3).join(', ')}, 0.6)`;
                        ctx.lineWidth = 0.5/globalScale;
                        ctx.stroke();
                      }
                    }
                  }
                } catch (error) {
                  console.debug('Skipped node rendering due to invalid values');
                }
                
                // Restore context
                ctx.restore();
              }}
              linkCanvasObjectMode={() => 'replace'}
              linkCanvasObject={(link, ctx, globalScale) => {
                // Get start & end coordinates
                const start = link.source;
                const end = link.target;
                
                // Safety check for valid coordinates
                if (!start || !end || !isFinite(start.x) || !isFinite(start.y) || !isFinite(end.x) || !isFinite(end.y)) {
                  return; // Skip rendering if coordinates are invalid
                }
                
                // Get the category color for the source node
                const sourceNode = graphData.nodes.find(node => node.id === link.source);
                const categoryStyle = sourceNode ? getCategoryNeonStyle(sourceNode.category) : { color: NEON_COLORS.edgeColor };
                
                // Extract RGB values for color transitions
                const rgbMatch = categoryStyle.color.match(/\d+/g);
                const edgeColor = rgbMatch ? `rgba(${rgbMatch.slice(0,3).join(', ')}, 0.6)` : NEON_COLORS.edgeColor;
                
                // Draw link with glow effect
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                
                // Add shadow for glow effect
                ctx.shadowColor = edgeColor;
                ctx.shadowBlur = 3;
                
                ctx.strokeStyle = edgeColor;
                ctx.lineWidth = 1.8/globalScale;
                ctx.stroke();
                
                // Reset shadow
                ctx.shadowBlur = 0;
                
                // Draw particles for directional flow
                const particleRelSize = 2.5;
                const particleCount = 4;
                const particleTime = Date.now() / 1000; // Use time for animation
                
                for (let i = 0; i < particleCount; i++) {
                  const t = ((particleTime * 0.5) % 1) + i / particleCount; // Stagger particles
                  const pos = t < 1 ? t : 2 - t;
                  
                  const x = start.x + (end.x - start.x) * pos;
                  const y = start.y + (end.y - start.y) * pos;
                  
                  // Skip if the calculated position is not valid
                  if (!isFinite(x) || !isFinite(y)) {
                    continue;
                  }
                  
                  // Particle radius with fade based on position
                  const radius = particleRelSize / globalScale;
                  
                  // Create glow effect for particles
                  try {
                    const grd = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
                    grd.addColorStop(0, categoryStyle.color);
                    grd.addColorStop(1, `rgba(${rgbMatch?.slice(0,3).join(', ') || '136, 255, 255'}, 0)`);
                    
                    // Add shadow for particle glow
                    ctx.shadowColor = categoryStyle.color;
                    ctx.shadowBlur = 5;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, 2 * Math.PI);
                    ctx.fillStyle = grd;
                    ctx.fill();
                    
                    // Reset shadow
                    ctx.shadowBlur = 0;
                  } catch (error) {
                    console.debug('Skipped particle rendering due to invalid coordinates');
                  }
                }
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
                  {MOCK_CATEGORIES.map(category => (
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
      <style dangerouslySetInnerHTML={{ __html: `
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
        
        /* Neuron graph effects */
        .neuron-graph-container {
          position: relative;
          overflow: hidden;
        }
        
        .neuron-graph-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, rgba(0, 40, 80, 0.2) 0%, rgba(0, 0, 20, 0) 70%);
          pointer-events: none;
          z-index: 1;
        }
        
        /* Enhance the glow effect */
        canvas {
          filter: blur(0.5px);
        }
      `}} />
    </div>
  );
};

export default Home; 