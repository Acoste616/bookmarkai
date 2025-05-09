import React from 'react';
import { useToast } from '@/hooks/use-toast';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg border ${
            toast.variant === 'destructive'
              ? 'bg-[#ff1e1e20] border-[#ff1e1e] text-[#ff1e1e]'
              : 'bg-[#00c3ff20] border-[#00c3ff] text-[#00c3ff]'
          } min-w-[300px] max-w-md`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{toast.title}</h4>
              {toast.description && (
                <p className="text-sm mt-1 opacity-80">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-current hover:opacity-70 transition-opacity"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 