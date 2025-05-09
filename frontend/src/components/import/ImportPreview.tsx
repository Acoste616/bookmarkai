import React from 'react';

interface ImportPreviewProps {
  bookmarks: any[] | null; // Replace 'any' with your bookmark type
  errors: string[];
  children?: React.ReactNode; // For buttons like "Preview File/URLs"
}

export const ImportPreview: React.FC<ImportPreviewProps> = ({ bookmarks, errors, children }) => {
  if (!bookmarks && errors.length === 0) {
    return <div className="mt-4 text-sm text-gray-500">{children || 'Preview will appear here.'}</div>;
  }

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-md max-h-60 overflow-y-auto">
      {children && <div className="mb-2">{children}</div>}
      {errors.length > 0 && (
        <div className="mb-2 text-red-600">
          <h4 className="font-semibold">Errors:</h4>
          <ul className="list-disc list-inside">
            {errors.map((err, idx) => <li key={idx}>{err}</li>)}
          </ul>
        </div>
      )}
      {bookmarks && bookmarks.length > 0 && (
        <div className="text-sm">
          <h4 className="font-semibold">Preview ({bookmarks.length} items):</h4>
          <ul className="list-disc list-inside">
            {bookmarks.slice(0, 10).map((bm, idx) => (
              <li key={idx} className="truncate" title={bm.url || bm.title || 'Invalid item'}>
                {bm.title || bm.url || 'Unnamed bookmark'}
              </li>
            ))}
            {bookmarks.length > 10 && <li>...and {bookmarks.length - 10} more.</li>}
          </ul>
        </div>
      )}
      {bookmarks && bookmarks.length === 0 && errors.length === 0 && (
        <p className="text-gray-500">No items to preview.</p>
      )}
    </div>
  );
}; 