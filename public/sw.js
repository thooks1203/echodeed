const CACHE_NAME = 'echoDeed-pwa-v1.0.0';
const OFFLINE_CACHE = 'echoDeed-offline-v1.0.0';
const API_CACHE = 'echoDeed-api-v1.0.0';

// Core files to cache for offline functionality
const CORE_CACHE_FILES = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// API patterns to cache
const API_PATTERNS = [
  '/api/kindness',
  '/api/certificates',
  '/api/esg-reports',
  '/api/dashboard'
];

// Install event - cache core resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_CACHE_FILES)),
      caches.open(OFFLINE_CACHE).then((cache) => cache.add('/offline.html'))
    ])
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => 
            cacheName !== CACHE_NAME && 
            cacheName !== OFFLINE_CACHE && 
            cacheName !== API_CACHE
          )
          .map((cacheName) => caches.delete(cacheName))
      )
    )
  );
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Serve cached API response if available
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return offline data structure for critical APIs
            if (url.pathname.includes('/api/kindness')) {
              return new Response(JSON.stringify({
                success: false,
                message: 'Offline mode - data will sync when connection is restored',
                offline: true,
                posts: JSON.parse(localStorage.getItem('offline-kindness') || '[]')
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            return new Response(JSON.stringify({
              error: 'Offline - feature unavailable',
              offline: true
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Handle static resources
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request);
    })
  );
});

// Background sync for offline posts
self.addEventListener('sync', (event) => {
  if (event.tag === 'kindness-sync') {
    event.waitUntil(syncOfflineKindness());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'EchoDeed™ notification',
    icon: '/pwa-icons/icon-192x192.png',
    badge: '/pwa-icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/pwa-icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/pwa-icons/icon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('EchoDeed™ Wellness Update', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync offline kindness posts when back online
async function syncOfflineKindness() {
  try {
    const offlineData = JSON.parse(localStorage.getItem('offline-kindness') || '[]');
    
    for (const post of offlineData) {
      await fetch('/api/kindness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post)
      });
    }
    
    // Clear offline data after successful sync
    localStorage.removeItem('offline-kindness');
    
    // Show success notification
    self.registration.showNotification('EchoDeed™ Sync Complete', {
      body: `${offlineData.length} kindness posts have been synced!`,
      icon: '/pwa-icons/icon-192x192.png',
      tag: 'sync-complete'
    });
    
  } catch (error) {
    console.error('Failed to sync offline data:', error);
  }
}