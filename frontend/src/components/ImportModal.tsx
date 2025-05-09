import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { bookmarkUtils } from "@/lib/bookmarkUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImportModalShell } from "./import/ImportModalShell";
import { ImportForm } from "./import/ImportForm";
import { ImportPreview } from "./import/ImportPreview";
import { ImportActions } from "./import/ImportActions";

type ImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Import source types
interface ImportSource {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImportSource, setSelectedImportSource] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("xApi");
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<any[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

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

  // Mutacje importu
  const { mutate: mutateFile, isPending: isFilePending } = useMutation({
    mutationFn: (formData: FormData) => bookmarkUtils.importFromX(formData),
    onSuccess: () => {
      toast({ title: "Success", description: "Bookmarks imported successfully" });
      setImportFile(null); onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/network"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories/stats"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to import bookmarks: ${error.message}`, variant: "destructive" });
    },
  });
  const { mutate: mutateText, isPending: isTextPending } = useMutation({
    mutationFn: (data: { text: string; auto_categorize: boolean }) => bookmarkUtils.importFromText(data.text, data.auto_categorize),
    onSuccess: (data) => {
      toast({ title: "Success", description: `Successfully imported ${data.count} bookmarks` });
      setText(""); setPreview(null); onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/network"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories/stats"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to import bookmarks: ${error.message}`, variant: "destructive" });
    },
  });

  // Process file import
  const handleImport = async () => {
    if (!selectedImportSource || !importFile) {
      toast({
        title: "Error",
        description: "Please select a source and upload a file",
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

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during import",
      });
    } finally {
      setImportLoading(false);
    }
  };

  // Handlery pliku
  const handleFileChange = (file: File) => setImportFile(file);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setImportFile(droppedFile);
  };

  // Handlery tekstu
  const handleTextChange = (val: string) => setText(val);

  // Import z pliku
  const handleFileImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      toast({ title: "Error", description: "Please select a file to import", variant: "destructive" });
      return;
    }
    const formData = new FormData();
    formData.append("file", importFile);
    mutateFile(formData);
  };

  // Import z tekstu
  const handleTextImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast({ title: "Error", description: "Please enter at least one URL", variant: "destructive" });
      return;
    }
    mutateText({ text, auto_categorize: true });
  };

  // Undo/reset
  const handleUndo = () => {
    setImportFile(null); setText(""); setPreview(null); setErrors([]);
  };

  // Podgląd (przykładowa logika, można rozbudować)
  const handlePreview = () => {
    if (activeTab === "file" && importFile) {
      // Przykład: odczytaj plik i pokaż podgląd (tylko JSON)
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setPreview(Array.isArray(data) ? data : [data]);
          setErrors([]);
        } catch (err) {
          setPreview(null);
          setErrors(["Invalid JSON file"]);
        }
      };
      reader.readAsText(importFile);
    } else if (activeTab === "text" && text) {
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      setPreview(lines.map(url => ({ url })));
      setErrors([]);
    }
  };

  // Akcje do przekazania do ImportActions
  const actionsProps = {
    loading: isFilePending || isTextPending,
    onStart: activeTab === "file" ? handleFileImport : handleTextImport,
    onUndo: handleUndo,
    onCancel: onClose,
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-[#151530] p-6 rounded-lg shadow-2xl border border-[#333] w-full max-w-3xl">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00c3ff] to-[#39ff14] mb-2">
          Import Bookmarks
        </h3>
        <p className="text-gray-300 mb-6">
          Import your bookmarks from various services and browsers
        </p>
        
        {!selectedImportSource ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {importSources.map(source => (
                <button
                  key={source.id}
                  onClick={() => setSelectedImportSource(source.id)}
                  className="bg-[#1a1a3a] border border-[#333] rounded-lg p-4 text-left hover:border-[#00c3ff] hover:shadow-[0_0_10px_rgba(0,195,255,0.2)] transition-all"
                >
                  <div className="text-2xl mb-2">{source.icon}</div>
                  <h4 className="text-[#00c3ff] font-medium mb-1">{source.name}</h4>
                  <p className="text-gray-400 text-sm">{source.description}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setSelectedImportSource(null)}
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
            </div>
          </>
        )}
        
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => {
              onClose();
              setSelectedImportSource(null);
              setImportFile(null);
            }}
            className="px-4 py-2 border border-[#333] text-gray-300 rounded-md hover:bg-[#1a1a3a] transition-colors"
          >
            Cancel
          </button>
          
          {selectedImportSource && (
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
                <>Import</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportModal; 