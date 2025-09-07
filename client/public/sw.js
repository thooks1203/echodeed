// EchoDeed™ Service Worker - PWA Capabilities
const CACHE_NAME = 'echodeed-v1.0.1-logo-refresh';
const OFFLINE_URL = '/offline.html';

const CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - Cache core resources
self.addEventListener('install', (event) => {
  console.log('EchoDeed™ Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching core resources');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('EchoDeed™ Service Worker installed successfully');
        return self.skipWaiting();
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('EchoDeed™ Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('EchoDeed™ Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - Network first, cache fallback strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // If requesting an HTML page, return offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Background Sync for offline posts
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-kindness') {
    console.log('Background sync: Uploading offline kindness posts');
    event.waitUntil(syncOfflineData());
  }
});

// Push notification support for corporate challenges
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New corporate challenge available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Challenge',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close', 
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('EchoDeed™ - Your Kindness, Amplified', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/?tab=corporate')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
  try {
    const cache = await caches.open('offline-posts');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const postData = await response.json();
      
      try {
        await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData)
        });
        
        // Remove from offline cache after successful sync
        await cache.delete(request);
        console.log('Synced offline post:', postData.content);
      } catch (error) {
        console.log('Failed to sync post, will retry later:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

console.log('EchoDeed™ Service Worker loaded - Your Kindness, Amplified! 🚀');