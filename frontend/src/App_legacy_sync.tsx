// This file is being renamed to App_legacy_sync.tsx
// The original content will be preserved under the new name.
import { useEffect, useState } from 'react';
import { SyncService } from './services/syncService';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated } = useAuth();
  const syncService = SyncService.getInstance();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync on app start
  useEffect(() => {
    if (isAuthenticated) {
      syncService.sync().catch(console.error);
    }
  }, [isAuthenticated]);

  // Sync on visibility change (app focus/blur)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        syncService.checkForUpdates().catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  // Sync before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated) {
        // Use synchronous XMLHttpRequest to ensure it completes
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/sync/upload', false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        const clientData = {
          bookmarks: useBookmarkStore.getState().bookmarks.map(b => ({
            ...b,
            createdAt: b.createdAt.toISOString(),
            updatedAt: b.updatedAt.toISOString()
          })),
          categories: useCategoryStore.getState().categories.map(c => ({
            ...c,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString()
          }))
        };

        xhr.send(JSON.stringify(clientData));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated]);

  return (
    <>
      {!isOnline && (
        <div style={{
          background: '#fbbf24',
          color: '#222',
          padding: '8px 0',
          textAlign: 'center',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          zIndex: 1000,
          position: 'sticky',
          top: 0,
        }}>
          Offline mode – dane mogą być nieświeże
        </div>
      )}
      {/* ...reszta layoutu... */}
    </>
  );
}

export default App; 