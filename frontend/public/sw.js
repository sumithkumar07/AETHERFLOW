// Enhanced Service Worker for Aether AI PWA
// Implements offline functionality, caching, and performance optimization

const CACHE_NAME = 'aether-ai-v1.0.0'
const OFFLINE_URL = '/offline.html'
const API_CACHE_NAME = 'aether-ai-api-v1.0.0'

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/chat',
  '/templates',
  '/projects',
  '/offline.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

// API endpoints to cache for offline functionality
const API_CACHE_URLS = [
  '/api/ai/agents',
  '/api/ai/models',
  '/api/templates',
  '/api/health'
]

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static resources')
        return cache.addAll(STATIC_CACHE_URLS)
      }),
      // Cache API responses
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('[SW] Pre-caching API responses')
        return Promise.all(
          API_CACHE_URLS.map(url => 
            fetch(url)
              .then(response => response.ok ? cache.put(url, response.clone()) : null)
              .catch(() => console.log(`[SW] Failed to cache ${url}`))
          )
        )
      })
    ]).then(() => {
      console.log('[SW] Installation complete')
      self.skipWaiting() // Immediately activate
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all([
        // Delete old caches
        ...cacheNames
          .filter(cacheName => 
            cacheName !== CACHE_NAME && 
            cacheName !== API_CACHE_NAME &&
            cacheName.startsWith('aether-ai-')
          )
          .map(cacheName => {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }),
        // Claim all clients immediately
        self.clients.claim()
      ])
    }).then(() => {
      console.log('[SW] Activation complete')
    })
  )
})

// Fetch event - handle requests with intelligent caching strategy
self.addEventListener('fetch', (event) => {
  // Skip non-http requests
  if (!event.request.url.startsWith('http')) return
  
  // Skip requests with specific headers (like authentication)
  if (event.request.headers.get('Authorization')) {
    return handleAPIRequest(event)
  }

  const url = new URL(event.request.url)
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(event))
  }
  // Handle navigation requests
  else if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event))
  }
  // Handle static assets
  else {
    event.respondWith(handleStaticRequest(event))
  }
})

// Handle API requests with cache-first strategy for performance
async function handleAPIRequest(event) {
  const request = event.request
  const url = new URL(request.url)
  
  try {
    // For GET requests, try cache first for performance
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request, { cacheName: API_CACHE_NAME })
      
      if (cachedResponse) {
        console.log('[SW] Serving API from cache:', url.pathname)
        
        // Update cache in background for next time
        fetch(request)
          .then(response => {
            if (response.ok) {
              caches.open(API_CACHE_NAME).then(cache => {
                cache.put(request, response.clone())
              })
            }
          })
          .catch(() => {}) // Ignore background update failures
        
        return cachedResponse
      }
    }
    
    // Fetch from network
    const networkResponse = await fetch(request)
    
    // Cache successful GET responses
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE_NAME)
      cache.put(request, networkResponse.clone())
      console.log('[SW] Cached API response:', url.pathname)
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('[SW] API request failed:', url.pathname, error)
    
    // Return cached response if available
    const cachedResponse = await caches.match(request, { cacheName: API_CACHE_NAME })
    if (cachedResponse) {
      console.log('[SW] Serving stale API response from cache:', url.pathname)
      return cachedResponse
    }
    
    // Return offline API response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature requires an internet connection',
        offline: true,
        cached: false
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle navigation requests with network-first strategy
async function handleNavigationRequest(event) {
  const request = event.request
  
  try {
    // Try network first for fresh content
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    
    throw new Error('Network response not ok')
    
  } catch (error) {
    console.log('[SW] Navigation request failed, checking cache:', request.url)
    
    // Try cache
    const cachedResponse = await caches.match(request, { cacheName: CACHE_NAME })
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    const offlineResponse = await caches.match(OFFLINE_URL, { cacheName: CACHE_NAME })
    if (offlineResponse) {
      return offlineResponse
    }
    
    // Fallback offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Aether AI - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            .container {
              max-width: 400px;
              background: rgba(255,255,255,0.1);
              backdrop-filter: blur(10px);
              border-radius: 16px;
              padding: 2rem;
              border: 1px solid rgba(255,255,255,0.2);
            }
            h1 { margin: 0 0 1rem 0; }
            p { opacity: 0.9; line-height: 1.6; margin-bottom: 2rem; }
            button {
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              color: white;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              cursor: pointer;
              font-size: 1rem;
              transition: all 0.2s;
            }
            button:hover {
              background: rgba(255,255,255,0.3);
              transform: translateY(-2px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📱 Aether AI</h1>
            <p>You're currently offline. Some features may be limited, but you can still access cached content and continue working.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Handle static asset requests with cache-first strategy
async function handleStaticRequest(event) {
  const request = event.request
  
  // Try cache first for static assets
  const cachedResponse = await caches.match(request, { cacheName: CACHE_NAME })
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    // Fetch from network and cache
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('[SW] Static request failed:', request.url)
    
    // For images, return a placeholder
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#f0f0f0" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#999">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      )
    }
    
    throw error
  }
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'chat-message-sync') {
    event.waitUntil(syncOfflineMessages())
  } else if (event.tag === 'performance-metrics-sync') {
    event.waitUntil(syncPerformanceMetrics())
  }
})

// Sync offline chat messages when back online
async function syncOfflineMessages() {
  try {
    // Get offline messages from IndexedDB
    const offlineMessages = await getOfflineMessages()
    
    for (const message of offlineMessages) {
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        })
        
        if (response.ok) {
          await removeOfflineMessage(message.id)
          console.log('[SW] Synced offline message:', message.id)
        }
      } catch (error) {
        console.log('[SW] Failed to sync message:', message.id, error)
      }
    }
  } catch (error) {
    console.log('[SW] Background sync failed:', error)
  }
}

// Sync performance metrics
async function syncPerformanceMetrics() {
  try {
    const metrics = await getOfflineMetrics()
    
    if (metrics && metrics.length > 0) {
      await fetch('/api/performance/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics })
      })
      
      await clearOfflineMetrics()
      console.log('[SW] Synced performance metrics')
    }
  } catch (error) {
    console.log('[SW] Failed to sync performance metrics:', error)
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Aether AI',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/xmark.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Aether AI', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus()
        }
        return clients.openWindow('/')
      })
    )
  }
})

// Message handling for client communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  } else if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(event.data.urls)
      })
    )
  }
})

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'performance-sync') {
    event.waitUntil(syncPerformanceMetrics())
  }
})

// Helper functions for IndexedDB operations (simplified)
async function getOfflineMessages() {
  // In a real implementation, this would use IndexedDB
  return JSON.parse(localStorage.getItem('offlineMessages') || '[]')
}

async function removeOfflineMessage(id) {
  const messages = await getOfflineMessages()
  const filtered = messages.filter(msg => msg.id !== id)
  localStorage.setItem('offlineMessages', JSON.stringify(filtered))
}

async function getOfflineMetrics() {
  return JSON.parse(localStorage.getItem('offlineMetrics') || '[]')
}

async function clearOfflineMetrics() {
  localStorage.removeItem('offlineMetrics')
}