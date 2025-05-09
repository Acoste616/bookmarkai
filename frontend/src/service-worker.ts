/// <reference lib="webworker" />

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for more information on the available caching strategies.

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'bookmark-brain-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json', // This path will need to be correct relative to public root
  '/favicon.png',   // Ensure these assets exist in the public root
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.json',  // Ensure this asset exists
];

// Installation event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Activation event
self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Take control of all clients
  self.clients.claim();
});

// Define route patterns for API requests
const apiRoutes = /\/api\//;
const networkFirstRoutes = /\.(js|css)$/;

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // API: stale-while-revalidate
  if (apiRoutes.test(event.request.url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => undefined);
        // Zwróć cache natychmiast, a fetchPromise zaktualizuje cache w tle
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Network-first strategy for JS/CSS files
  if (networkFirstRoutes.test(event.request.url)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the network response for future use
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || Promise.reject('no-match');
          });
        })
    );
    return;
  }

  // Cache-first strategy for other requests (HTML, images, etc.)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses or non-GET requests
          if (!response.ok || event.request.method !== 'GET') {
            return response;
          }

          // Cache the new response for future use
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });

          return response;
        })
        .catch(async (error) => {
          console.error('Fetch failed:', error);
          // Fallback: jeśli to obraz lub HTML, zwróć offline.json
          const accept = event.request.headers.get('accept') || '';
          if (
            event.request.destination === 'image' ||
            accept.includes('image') ||
            event.request.destination === 'document' ||
            accept.includes('text/html')
          ) {
            const offline = await caches.match('/offline.json');
            if (offline) return offline;
          }
          // Jeśli to nawigacja, zwróć index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Network error', { status: 503 });
        });
    })
  );
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookmarks') {
    event.waitUntil(syncBookmarks());
  }
});

// Function to synchronize bookmarks when coming back online
async function syncBookmarks() {
  try {
    const db = await openDB();
    const tx = db.transaction('offline-operations', 'readonly');
    const store = tx.objectStore('offline-operations');
    const operations = await store.getAll();
    
    for (const op of operations) {
      try {
        await performOperation(op);
        // If successful, remove from offline store
        const deleteTx = db.transaction('offline-operations', 'readwrite');
        const deleteStore = deleteTx.objectStore('offline-operations');
        await deleteStore.delete(op.id);
        // await deleteTx.complete; // IndexedDB transactions auto-commit
      } catch (error) {
        console.error('Failed to sync operation:', op, error);
        // Keep in store to try again later
      }
    }
    
    // await tx.complete; // IndexedDB transactions auto-commit
    db.close();
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper function to open indexed DB
interface OfflineOperation {
  id?: number;
  type: string;
  url: string;
  data?: any;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('bookmark-brain-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('offline-operations')) {
        db.createObjectStore('offline-operations', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Helper function to perform network operations
async function performOperation(operation: OfflineOperation) {
  const { type, url, data } = operation;
  
  const response = await fetch(url, {
    method: type,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`Operation failed with status ${response.status}`);
  }
  
  // Check if response has content before trying to parse as JSON
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    return response.text(); // or handle as appropriate
  }
} 