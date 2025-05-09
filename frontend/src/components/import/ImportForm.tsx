import React from 'react';

interface ImportFormProps {
  mode: 'file' | 'text';
  file?: File | null;
  isDragging?: boolean;
  onFileChange?: (file: File) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  text?: string;
  onTextChange?: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode; // For action buttons
}

export const ImportForm: React.FC<ImportFormProps> = (props) => {
  const { 
    mode, file, isDragging, onFileChange, onDragOver, onDragLeave, onDrop, 
    text, onTextChange, onSubmit, children 
  } = props;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === 'file' && onFileChange && onDragOver && onDragLeave && onDrop && (
        <div 
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`p-6 border-2 border-dashed rounded-md text-center ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        >
          <input 
            type="file" 
            onChange={(e) => e.target.files && onFileChange(e.target.files[0])} 
            className="hidden" 
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <p className="text-gray-700">Drag & drop a file here, or click to select</p>
            {file && <p className="text-sm text-gray-500 mt-1">Selected: {file.name}</p>}
          </label>
        </div>
      )}
      {mode === 'text' && onTextChange && (
        <div>
          <label htmlFor="text-import" className="block text-sm font-medium text-gray-700 mb-1">
            Paste URLs (one per line):
          </label>
          <textarea 
            id="text-import"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            rows={6}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/page1\nhttps://another.org/article2"
          />
        </div>
      )}
      <div>
        {children} {/* Action buttons are passed as children */}
      </div>
    </form>
  );
}; 