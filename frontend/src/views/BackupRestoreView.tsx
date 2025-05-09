import React, { useRef } from 'react';
import { api } from '../lib/api';

// Renamed from SettingsView.tsx to BackupRestoreView.tsx
export default function BackupRestoreView() { // Changed function name
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pobierz backup
  const handleDownloadBackup = async () => {
    try {
      const res = await api.get('/api/backup');
      if (res.data.success) {
        const dataStr = JSON.stringify(res.data.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bookmarkbrain-backup.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      alert('Błąd pobierania backupu');
    }
  };

  // Przywróć backup
  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm('Przywrócenie backupu nadpisze wszystkie Twoje dane. Kontynuować?')) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await api.post('/api/restore', json);
      if (res.data.success) {
        alert('Backup przywrócony! Odśwież stronę.');
      } else {
        alert('Błąd przywracania backupu: ' + res.data.error);
      }
    } catch (e) {
      alert('Błąd przywracania backupu');
    }
  };

  return (
    <div>
      {/* ...inne ustawienia... */}
      <button onClick={handleDownloadBackup}>
        Pobierz backup
      </button>
      <input
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleRestoreBackup}
      />
      <button onClick={() => fileInputRef.current?.click()}>
        Przywróć backup z pliku
      </button>
    </div>
  );
} 