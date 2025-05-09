import React, { useState } from 'react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// Import source types
interface ImportSource {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const NEON_COLORS = {
  blue: '#00c3ff',     // Primary neon blue
  pink: '#ff00aa',      // Secondary neon pink 
  green: '#39ff14',     // Green accent
  yellow: '#ffea00',    // Yellow for highlighted items
  purple: '#b417ae',   // Purple accent
  orange: '#ff7d00',    // Orange accent
  red: '#ff1e1e',       // Red accent
  teal: '#00d2b4',      // Teal accent
  gold: '#ffd700',      // Gold accent
  lime: '#b4ff14',     // Lime accent
};

const SettingsView: React.FC = () => {
  // States
  const [activeTab, setActiveTab] = useState<'imports' | 'preferences' | 'account' | 'data'>('imports');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [selectedTheme, setSelectedTheme] = useState('cyberpunk');
  const [showNotifications, setShowNotifications] = useState(true);
  const [defaultView, setDefaultView] = useState<'graph' | 'list'>('graph');
  const [autoBackup, setAutoBackup] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [selectedImportSource, setSelectedImportSource] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  
  const { toast } = useToast();
  
  // Import sources
  const importSources: ImportSource[] = [
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: '🐦',
      description: 'Import your Twitter/X bookmarks via CSV export'
    },
    {
      id: 'chrome',
      name: 'Chrome',
      icon: '🌐',
      description: 'Import bookmarks from Google Chrome (HTML format)'
    },
    {
      id: 'firefox',
      name: 'Firefox',
      icon: '🦊',
      description: 'Import bookmarks from Mozilla Firefox (JSON format)'
    },
    {
      id: 'safari',
      name: 'Safari',
      icon: '🧭',
      description: 'Import bookmarks from Safari (HTML format)'
    },
    {
      id: 'pocket',
      name: 'Pocket',
      icon: '📑',
      description: 'Import saved articles from Pocket (CSV format)'
    },
    {
      id: 'custom',
      name: 'Custom Import',
      icon: '📝',
      description: 'Import bookmarks from custom CSV or JSON format'
    }
  ];
  
  // Handle save settings
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };
  
  // Handle import request
  const handleImportRequest = (sourceId: string) => {
    setSelectedImportSource(sourceId);
  };
  
  // Handle import
  const handleImport = async () => {
    if (!selectedImportSource || !importFile) {
      toast({
        title: "Error",
        description: "Please select a file to import",
      });
      return;
    }

    setImportLoading(true);

    try {
      // Mock processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Import successful",
        description: `Imported bookmarks from ${importSources.find(s => s.id === selectedImportSource)?.name}`,
      });
      
      setImportLoading(false);
      setImportFile(null);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during import",
      });
      setImportLoading(false);
    }
  };
  
  // Handle export
  const handleExport = () => {
    toast({
      title: "Export started",
      description: `Exporting your bookmarks in ${exportFormat.toUpperCase()} format`,
    });
    
    // Mock export delay
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: "Your bookmarks have been exported successfully",
      });
    }, 1500);
  };
  
  // Handle data reset
  const handleDataReset = () => {
    const confirmed = window.confirm("Are you sure you want to reset all your data? This action cannot be undone.");
    
    if (confirmed) {
      toast({
        title: "Data reset",
        description: "All your data has been reset to default",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#080825] text-gray-100">
      {/* Header */}
      <div className="bg-[#0a0a2a] border-b border-[#333] py-5 px-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00c3ff] to-[#ff00aa]">
                Settings
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/">
                <a className="px-4 py-2 bg-[#1a1a3a] rounded hover:bg-[#252550] transition-colors duration-300 flex items-center">
                  <span className="mr-2">🔍</span>
                  Graph View
                </a>
              </Link>
              
              <Link href="/list">
                <a className="px-4 py-2 bg-[#1a1a3a] rounded hover:bg-[#252550] transition-colors duration-300 flex items-center">
                  <span className="mr-2">📋</span>
                  List View
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar / Navigation */}
          <div className="md:col-span-1 bg-[#0a0a2a] p-4 rounded-lg border border-[#333] h-fit">
            <nav>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('imports')}
                    className={`w-full text-left px-4 py-3 rounded-md flex items-center transition-colors ${
                      activeTab === 'imports' 
                        ? 'bg-[#1a1a3a] border-l-4 border-[#00c3ff]' 
                        : 'hover:bg-[#151530]'
                    }`}
                  >
                    <span className="mr-3 text-xl">📥</span>
                    <span className={activeTab === 'imports' ? 'text-[#00c3ff]' : ''}>
                      Import & Export
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className={`w-full text-left px-4 py-3 rounded-md flex items-center transition-colors ${
                      activeTab === 'preferences' 
                        ? 'bg-[#1a1a3a] border-l-4 border-[#ff00aa]' 
                        : 'hover:bg-[#151530]'
                    }`}
                  >
                    <span className="mr-3 text-xl">⚙️</span>
                    <span className={activeTab === 'preferences' ? 'text-[#ff00aa]' : ''}>
                      Preferences
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`w-full text-left px-4 py-3 rounded-md flex items-center transition-colors ${
                      activeTab === 'account' 
                        ? 'bg-[#1a1a3a] border-l-4 border-[#39ff14]' 
                        : 'hover:bg-[#151530]'
                    }`}
                  >
                    <span className="mr-3 text-xl">👤</span>
                    <span className={activeTab === 'account' ? 'text-[#39ff14]' : ''}>
                      Account
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('data')}
                    className={`w-full text-left px-4 py-3 rounded-md flex items-center transition-colors ${
                      activeTab === 'data' 
                        ? 'bg-[#1a1a3a] border-l-4 border-[#ffea00]' 
                        : 'hover:bg-[#151530]'
                    }`}
                  >
                    <span className="mr-3 text-xl">💾</span>
                    <span className={activeTab === 'data' ? 'text-[#ffea00]' : ''}>
                      Data Management
                    </span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          
          {/* Main settings panel */}
          <div className="md:col-span-3 bg-[#0a0a2a] rounded-lg border border-[#333] shadow-xl p-6">
            {/* Import & Export Tab */}
            {activeTab === 'imports' && (
              <div>
                <h2 className="text-xl font-bold text-[#00c3ff] mb-6 flex items-center">
                  <span className="mr-2">📥</span> Import & Export Bookmarks
                </h2>
                
                {/* Import Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-white">Import From External Sources</h3>
                  
                  {!selectedImportSource ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {importSources.map(source => (
                        <button
                          key={source.id}
                          onClick={() => handleImportRequest(source.id)}
                          className="bg-[#1a1a3a] border border-[#333] rounded-lg p-4 text-left hover:border-[#00c3ff] hover:shadow-[0_0_10px_rgba(0,195,255,0.2)] transition-all"
                        >
                          <div className="text-2xl mb-2">{source.icon}</div>
                          <h4 className="text-[#00c3ff] font-medium mb-1">{source.name}</h4>
                          <p className="text-gray-400 text-sm">{source.description}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <button
                          onClick={() => {
                            setSelectedImportSource(null);
                            setImportFile(null);
                          }}
                          className="mr-3 text-gray-400 hover:text-white"
                        >
                          ← Back
                        </button>
                        <h4 className="text-lg font-medium">
                          <span className="mr-2">
                            {importSources.find(s => s.id === selectedImportSource)?.icon}
                          </span>
                          Import from {importSources.find(s => s.id === selectedImportSource)?.name}
                        </h4>
                      </div>
                      
                      <div className="bg-[#0a0a25] border border-dashed border-[#333] rounded-lg p-6 text-center">
                        {importFile ? (
                          <div className="flex flex-col items-center">
                            <div className="text-2xl mb-2">📄</div>
                            <p className="text-[#00c3ff] font-medium mb-1">{importFile.name}</p>
                            <p className="text-gray-400 text-sm mb-4">
                              {(importFile.size / 1024).toFixed(1)} KB
                            </p>
                            <button
                              onClick={() => setImportFile(null)}
                              className="text-[#ff1e1e] text-sm hover:underline"
                            >
                              Remove file
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="text-3xl mb-3">📥</div>
                            <p className="text-gray-300 mb-4">Drag and drop your file here, or click to select</p>
                            <input
                              type="file"
                              id="import-file"
                              className="hidden"
                              accept={
                                selectedImportSource === 'chrome' || selectedImportSource === 'safari' 
                                  ? '.html,.htm' 
                                  : selectedImportSource === 'firefox' 
                                    ? '.json' 
                                    : '.csv,.json'
                              }
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  setImportFile(e.target.files[0]);
                                }
                              }}
                            />
                            <label
                              htmlFor="import-file"
                              className="px-4 py-2 bg-[#1a1a3a] border border-[#333] rounded cursor-pointer hover:bg-[#252550] transition-colors inline-block"
                            >
                              Choose File
                            </label>
                          </>
                        )}
                      </div>
                      
                      <div className="mt-4 text-sm text-gray-400">
                        {selectedImportSource === 'twitter' && (
                          <p>Export your Twitter/X bookmarks from your Twitter account settings and upload the CSV file.</p>
                        )}
                        {selectedImportSource === 'chrome' && (
                          <p>In Chrome, go to Bookmarks → Bookmark Manager → ⋮ → Export Bookmarks and upload the HTML file.</p>
                        )}
                        {selectedImportSource === 'firefox' && (
                          <p>In Firefox, go to Bookmarks → Show All Bookmarks → Import and Backup → Export Bookmarks to HTML and upload the file.</p>
                        )}
                        {selectedImportSource === 'safari' && (
                          <p>In Safari, go to File → Export Bookmarks and upload the HTML file.</p>
                        )}
                        {selectedImportSource === 'pocket' && (
                          <p>In Pocket, go to Settings → Export → Export as CSV and upload the file.</p>
                        )}
                        {selectedImportSource === 'custom' && (
                          <p>Upload a CSV file with columns: Title, URL, Description (optional), Category (optional), Tags (optional, semicolon-separated)</p>
                        )}
                      </div>
                      
                      <div className="mt-6">
                        <button
                          onClick={handleImport}
                          disabled={!importFile || importLoading}
                          className={`px-4 py-2 bg-[#00c3ff20] text-[#00c3ff] border border-[#00c3ff] rounded-md hover:bg-[#00c3ff30] transition-colors flex items-center ${(!importFile || importLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {importLoading ? (
                            <>
                              <span className="animate-spin inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
                              Processing...
                            </>
                          ) : (
                            <>Start Import</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Export Section */}
                <div className="border-t border-[#333] pt-6 mb-4">
                  <h3 className="text-lg font-semibold mb-4 text-white">Export Your Bookmarks</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Export Format</label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-[#00c3ff]"
                          checked={exportFormat === 'json'}
                          onChange={() => setExportFormat('json')}
                        />
                        <span className="ml-2">JSON</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-[#00c3ff]"
                          checked={exportFormat === 'csv'}
                          onChange={() => setExportFormat('csv')}
                        />
                        <span className="ml-2">CSV</span>
                      </label>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-[#1a1a3a] text-white border border-[#333] rounded-md hover:bg-[#252550] transition-colors"
                  >
                    Export Bookmarks
                  </button>
                </div>
                
                {/* Quick Import Links */}
                <div className="border-t border-[#333] pt-6 mb-4">
                  <h3 className="text-lg font-semibold mb-4 text-white">Quick Import Links</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-medium mb-2 text-gray-300">Social Media</h4>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleImportRequest('twitter')}
                          className="px-3 py-2 bg-[#1a1a3a] border border-[#333] rounded flex items-center hover:bg-[#252550] transition-colors"
                        >
                          <span className="mr-2 text-lg">🐦</span>
                          Twitter/X
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-medium mb-2 text-gray-300">Browsers</h4>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleImportRequest('chrome')}
                          className="px-3 py-2 bg-[#1a1a3a] border border-[#333] rounded flex items-center hover:bg-[#252550] transition-colors"
                        >
                          <span className="mr-2 text-lg">🌐</span>
                          Chrome
                        </button>
                        <button
                          onClick={() => handleImportRequest('firefox')}
                          className="px-3 py-2 bg-[#1a1a3a] border border-[#333] rounded flex items-center hover:bg-[#252550] transition-colors"
                        >
                          <span className="mr-2 text-lg">🦊</span>
                          Firefox
                        </button>
                        <button
                          onClick={() => handleImportRequest('safari')}
                          className="px-3 py-2 bg-[#1a1a3a] border border-[#333] rounded flex items-center hover:bg-[#252550] transition-colors"
                        >
                          <span className="mr-2 text-lg">🧭</span>
                          Safari
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-medium mb-2 text-gray-300">Reading & Other</h4>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleImportRequest('pocket')}
                          className="px-3 py-2 bg-[#1a1a3a] border border-[#333] rounded flex items-center hover:bg-[#252550] transition-colors"
                        >
                          <span className="mr-2 text-lg">📑</span>
                          Pocket
                        </button>
                        <button
                          onClick={() => handleImportRequest('custom')}
                          className="px-3 py-2 bg-[#1a1a3a] border border-[#333] rounded flex items-center hover:bg-[#252550] transition-colors"
                        >
                          <span className="mr-2 text-lg">📝</span>
                          Custom Format
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <h2 className="text-xl font-bold text-[#ff00aa] mb-6 flex items-center">
                  <span className="mr-2">⚙️</span> Preferences
                </h2>
                
                <div className="space-y-6">
                  {/* UI Theme */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">UI Theme</label>
                    <select
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      className="w-full max-w-xs pl-3 pr-10 py-2 bg-[#1a1a3a] border border-[#333] rounded appearance-none focus:outline-none focus:ring-2 focus:ring-[#ff00aa] focus:border-transparent cursor-pointer"
                    >
                      <option value="cyberpunk">Cyberpunk (Default)</option>
                      <option value="dark">Dark Mode</option>
                      <option value="light">Light Mode</option>
                      <option value="synthwave">Synthwave</option>
                    </select>
                  </div>
                  
                  {/* Default View */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Default View</label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-[#ff00aa]"
                          checked={defaultView === 'graph'}
                          onChange={() => setDefaultView('graph')}
                        />
                        <span className="ml-2">Graph View</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-[#ff00aa]"
                          checked={defaultView === 'list'}
                          onChange={() => setDefaultView('list')}
                        />
                        <span className="ml-2">List View</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Notifications */}
                  <div className="mb-4">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={showNotifications}
                          onChange={() => setShowNotifications(!showNotifications)}
                        />
                        <div className={`w-10 h-5 ${showNotifications ? 'bg-[#ff00aa]' : 'bg-[#333]'} rounded-full shadow-inner transition-colors duration-300`}></div>
                        <div className={`absolute left-0 top-0 w-5 h-5 bg-white rounded-full transform transition-transform duration-300 ${showNotifications ? 'translate-x-5' : ''}`}></div>
                      </div>
                      <span className="ml-3">Show notifications</span>
                    </label>
                  </div>
                  
                  {/* Auto Backup */}
                  <div className="mb-4">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={autoBackup}
                          onChange={() => setAutoBackup(!autoBackup)}
                        />
                        <div className={`w-10 h-5 ${autoBackup ? 'bg-[#ff00aa]' : 'bg-[#333]'} rounded-full shadow-inner transition-colors duration-300`}></div>
                        <div className={`absolute left-0 top-0 w-5 h-5 bg-white rounded-full transform transition-transform duration-300 ${autoBackup ? 'translate-x-5' : ''}`}></div>
                      </div>
                      <span className="ml-3">Automatic daily backup</span>
                    </label>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-[#333]">
                    <button
                      onClick={handleSaveSettings}
                      className="px-4 py-2 bg-[#ff00aa20] text-[#ff00aa] border border-[#ff00aa] rounded-md hover:bg-[#ff00aa30] transition-colors"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div>
                <h2 className="text-xl font-bold text-[#39ff14] mb-6 flex items-center">
                  <span className="mr-2">👤</span> Account Settings
                </h2>
                
                <div className="space-y-6">
                  {/* Account Information */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-white">Account Information</h3>
                    
                    <div className="bg-[#1a1a3a] p-4 rounded-lg border border-[#333] mb-4">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00c3ff] to-[#39ff14] flex items-center justify-center text-2xl">
                          👤
                        </div>
                        <div className="ml-4">
                          <p className="text-xl font-semibold text-white">Guest User</p>
                          <p className="text-sm text-gray-400">Using local storage mode</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-4">
                        You're currently using BookmarkBrain in local mode. Your data is stored only on your device.
                      </p>
                      
                      <button
                        onClick={() => toast({
                          title: "Feature coming soon",
                          description: "Cloud account functionality is under development",
                        })}
                        className="px-4 py-2 bg-[#39ff1420] text-[#39ff14] border border-[#39ff14] rounded-md hover:bg-[#39ff1430] transition-colors"
                      >
                        Upgrade to Cloud Account
                      </button>
                    </div>
                  </div>
                  
                  {/* Sync Settings */}
                  <div className="border-t border-[#333] pt-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-white">Sync Settings</h3>
                    <p className="text-gray-400 mb-4">
                      Cloud sync is only available with a BookmarkBrain account.
                    </p>
                    
                    <div className="flex flex-col gap-3 opacity-50">
                      <label className="flex items-center cursor-not-allowed">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            disabled
                          />
                          <div className={`w-10 h-5 bg-[#333] rounded-full shadow-inner`}></div>
                          <div className={`absolute left-0 top-0 w-5 h-5 bg-white rounded-full`}></div>
                        </div>
                        <span className="ml-3">Sync across devices</span>
                      </label>
                      
                      <label className="flex items-center cursor-not-allowed">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            disabled
                          />
                          <div className={`w-10 h-5 bg-[#333] rounded-full shadow-inner`}></div>
                          <div className={`absolute left-0 top-0 w-5 h-5 bg-white rounded-full`}></div>
                        </div>
                        <span className="ml-3">Auto-sync with browsers</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Data Management Tab */}
            {activeTab === 'data' && (
              <div>
                <h2 className="text-xl font-bold text-[#ffea00] mb-6 flex items-center">
                  <span className="mr-2">💾</span> Data Management
                </h2>
                
                <div className="space-y-6">
                  {/* Storage Info */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-white">Storage Information</h3>
                    
                    <div className="bg-[#1a1a3a] p-4 rounded-lg border border-[#333]">
                      <div className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span>Local Storage Used</span>
                          <span>1.2 MB / 5 MB</span>
                        </div>
                        <div className="w-full h-2 bg-[#333] rounded-full overflow-hidden">
                          <div className="h-full bg-[#ffea00]" style={{ width: '24%' }}></div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-400">
                        <p className="mb-2">• Bookmarks: 25</p>
                        <p className="mb-2">• Categories: 10</p>
                        <p>• Tags: 35</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Backup & Restore */}
                  <div className="border-t border-[#333] pt-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-white">Backup & Restore</h3>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                      <button
                        onClick={() => toast({
                          title: "Backup created",
                          description: "Your data has been backed up",
                        })}
                        className="px-4 py-2 bg-[#1a1a3a] text-white border border-[#333] rounded-md hover:bg-[#252550] transition-colors"
                      >
                        Create Backup
                      </button>
                      
                      <button
                        onClick={() => toast({
                          title: "Select backup file",
                          description: "Choose a backup file to restore",
                        })}
                        className="px-4 py-2 bg-[#1a1a3a] text-white border border-[#333] rounded-md hover:bg-[#252550] transition-colors"
                      >
                        Restore from Backup
                      </button>
                    </div>
                  </div>
                  
                  {/* Reset Data */}
                  <div className="border-t border-[#333] pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-[#ff1e1e]">Danger Zone</h3>
                    
                    <div className="bg-[#1a1a3a] p-4 rounded-lg border border-[#ff1e1e20]">
                      <p className="text-gray-300 mb-4">
                        Resetting your data will permanently delete all your bookmarks, categories, and tags. This action cannot be undone.
                      </p>
                      
                      <button
                        onClick={handleDataReset}
                        className="px-4 py-2 bg-[#ff1e1e20] text-[#ff1e1e] border border-[#ff1e1e] rounded-md hover:bg-[#ff1e1e30] transition-colors"
                      >
                        Reset All Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Custom styles */}
      <style jsx>{`
        /* Gradient text effect */
        .gradient-text {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          background-image: linear-gradient(to right, #00c3ff, #ff00aa);
        }
      `}</style>
    </div>
  );
};

export default SettingsView; 