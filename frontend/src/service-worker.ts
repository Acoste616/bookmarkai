/// <reference lib="webworker" />

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for more information on the available caching strategies.

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'bookmark-brain-cache-v1';

// Assets that should be pre-cached for offline access
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html',
];

// Installation event - pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache:', CACHE_NAME);
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Activation event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Take control of all clients
  self.clients.claim();
});

// Define route patterns for different caching strategies
const apiRoutes = /\/api\//;
const networkFirstRoutes = /\.(js|css)$/;

// Fetch event - handle network requests with appropriate caching strategies
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // API Routes: stale-while-revalidate strategy
  if (apiRoutes.test(event.request.url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        // Try cache first
        const cachedResponse = await cache.match(event.request);
        
        // Fetch from network and update cache
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              // Update cache with fresh network response
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => undefined);
        
        // Return cache immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // JS/CSS Files: network-first strategy
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

  // All other assets: cache-first strategy
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
          
          // Fallback for images and HTML
          const accept = event.request.headers.get('accept') || '';
          
          if (
            event.request.destination === 'image' ||
            accept.includes('image')
          ) {
            // Serve placeholder image
            return caches.match('/img/placeholder.png');
          }
          
          // For navigation requests, return offline HTML
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          
          // For other requests that failed
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
      } catch (error) {
        console.error('Failed to sync operation:', op, error);
        // Keep in store to try again later
      }
    }
    
    db.close();
    
    // Notify users that sync is complete
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETED',
          timestamp: new Date().toISOString()
        });
      });
    });
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper function to open indexed DB
function openDB() {
  return new Promise((resolve, reject) => {
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
async function performOperation(operation) {
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
  
  // Parse response based on content type
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    return response.text();
  }
} 