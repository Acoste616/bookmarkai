import React from 'react';

interface ImportModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const ImportModalShell: React.FC<ImportModalShellProps> = ({ isOpen, onClose, activeTab, setActiveTab, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Import Bookmarks</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        <div className="mb-4 border-b">
          <nav className="flex space-x-4">
            {/* Basic Tabs - can be improved with actual tab components */}
            <button 
              onClick={() => setActiveTab('file')} 
              className={`py-2 px-4 ${activeTab === 'file' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              From File
            </button>
            <button 
              onClick={() => setActiveTab('text')} 
              className={`py-2 px-4 ${activeTab === 'text' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              From Text
            </button>
            <button 
              onClick={() => setActiveTab('xApi')} 
              className={`py-2 px-4 ${activeTab === 'xApi' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              From X (Twitter)
            </button>
          </nav>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}; 