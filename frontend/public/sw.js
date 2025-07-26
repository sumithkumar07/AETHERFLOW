/**
 * 🚀 AETHERFLOW Service Worker
 * 
 * Progressive Web App service worker for offline functionality,
 * caching strategies, and performance optimization
 */

const CACHE_NAME = 'aetherflow-v1.0.0';
const RUNTIME_CACHE = 'aetherflow-runtime';
const OFFLINE_URL = '/offline.html';

// Resources to cache immediately
const PRECACHE_RESOURCES = [
  '/',
  '/app',
  '/auth',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/offline.html'
];

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
  // Static assets - cache first
  static: [
    /\.(?:js|css|html|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/,
    /^\/static\//,
    /^\/favicon\.ico$/
  ],
  
  // API calls - network first with fallback
  api: [
    /^\/api\//,
    /^https:\/\/api\./
  ],
  
  // Dynamic content - stale while revalidate
  dynamic: [
    /^\/app/,
    /^\/auth/,
    /^\/dashboard/
  ]
};

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('🌌 AETHERFLOW Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching precache resources');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => {
        console.log('✅ AETHERFLOW Service Worker installed');
        self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 AETHERFLOW Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ AETHERFLOW Service Worker activated');
        self.clients.claim();
      })
  );
});

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip requests from browser extensions
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  // Determine cache strategy
  const strategy = getCacheStrategy(request.url);
  
  switch (strategy) {
    case 'static':
      event.respondWith(cacheFirst(request));
      break;
    case 'api':
      event.respondWith(networkFirst(request));
      break;
    case 'dynamic':
      event.respondWith(staleWhileRevalidate(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

// Cache first strategy (for static assets)
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network first strategy (for API calls)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses
    if (networkResponse.ok && request.url.includes('/api/')) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for navigation requests
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Stale while revalidate strategy (for dynamic content)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse;
  });
  
  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || networkResponsePromise;
}

// Determine cache strategy based on URL
function getCacheStrategy(url) {
  for (const [strategy, patterns] of Object.entries(CACHE_STRATEGIES)) {
    if (patterns.some(pattern => pattern.test(url))) {
      return strategy;
    }
  }
  return 'default';
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        // Remove successful action from pending queue
        await removePendingAction(action.id);
        
        console.log('✅ Background sync completed for:', action.url);
      } catch (error) {
        console.error('❌ Background sync failed for:', action.url, error);
      }
    }
  } catch (error) {
    console.error('❌ Background sync error:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📨 Push notification received:', event.data?.text());
  
  const options = {
    body: event.data?.text() || 'New update available',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open AETHERFLOW',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/logo192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('AETHERFLOW VibeCoder', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/app')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('💬 Message received in SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Utility functions for IndexedDB operations
async function getPendingActions() {
  // Implementation would use IndexedDB to store pending actions
  return [];
}

async function removePendingAction(id) {
  // Implementation would remove action from IndexedDB
  return true;
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('🚨 Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection in SW:', event.reason);
  event.preventDefault();
});

console.log('🌌 AETHERFLOW Service Worker loaded successfully');