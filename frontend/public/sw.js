// AI Tempo Service Worker - Progressive Web App Support
const CACHE_NAME = 'ai-tempo-v1.0.0'
const OFFLINE_URL = '/offline.html'

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js'
]

// Dynamic cache for API responses and user data
const DYNAMIC_CACHE_NAME = 'ai-tempo-dynamic-v1'
const API_CACHE_NAME = 'ai-tempo-api-v1'

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME)
        console.log('Service Worker: Caching static assets')
        await cache.addAll(STATIC_CACHE_URLS)
        
        // Skip waiting to activate immediately
        self.skipWaiting()
      } catch (error) {
        console.error('Service Worker: Installation failed', error)
      }
    })()
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys()
        const deletePromises = cacheNames
          .filter(name => name !== CACHE_NAME && name !== DYNAMIC_CACHE_NAME && name !== API_CACHE_NAME)
          .map(name => {
            console.log('Service Worker: Deleting old cache', name)
            return caches.delete(name)
          })
        
        await Promise.all(deletePromises)
        
        // Take control of all pages
        await self.clients.claim()
        console.log('Service Worker: Activated successfully')
      } catch (error) {
        console.error('Service Worker: Activation failed', error)
      }
    })()
  )
})

// Fetch event - handle requests with cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and external URLs
  if (request.method !== 'GET' || !url.origin.includes(location.origin)) {
    return
  }

  // Handle different types of requests with appropriate strategies
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First with cache fallback
    event.respondWith(handleApiRequest(request))
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
    // Static assets - Cache First
    event.respondWith(handleStaticAssets(request))
  } else {
    // HTML pages - Network First with offline fallback
    event.respondWith(handlePageRequest(request))
  }
})

// Network First strategy for API requests
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Network failed, try cache
    console.log('Service Worker: API network failed, trying cache', request.url)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline API response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature requires an internet connection',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Cache First strategy for static assets
async function handleStaticAssets(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Cache miss, fetch from network
    const networkResponse = await fetch(request)
    
    // Cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Service Worker: Failed to fetch static asset', request.url, error)
    
    // Return a placeholder for critical assets
    if (request.url.includes('.css')) {
      return new Response('/* Offline - CSS unavailable */', {
        headers: { 'Content-Type': 'text/css' }
      })
    }
    
    // For other assets, just fail gracefully
    return new Response('', { status: 404 })
  }
}

// Network First strategy for HTML pages
async function handlePageRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful page responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Network failed, try cache
    console.log('Service Worker: Page network failed, trying cache', request.url)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Show offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match(OFFLINE_URL)
      return offlineResponse || new Response('Offline', { 
        status: 503,
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    return new Response('Offline', { status: 503 })
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag)
  
  if (event.tag === 'sync-projects') {
    event.waitUntil(syncProjects())
  }
  
  if (event.tag === 'sync-chat-messages') {
    event.waitUntil(syncChatMessages())
  }
})

// Sync offline projects when connection restored
async function syncProjects() {
  try {
    console.log('Service Worker: Syncing offline projects...')
    
    // Get offline projects from IndexedDB or localStorage
    const offlineProjects = await getOfflineProjects()
    
    for (const project of offlineProjects) {
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(project)
        })
        
        if (response.ok) {
          await removeOfflineProject(project.id)
          console.log('Service Worker: Project synced successfully', project.name)
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync project', project.name, error)
      }
    }
  } catch (error) {
    console.error('Service Worker: Project sync failed', error)
  }
}

// Sync offline chat messages
async function syncChatMessages() {
  try {
    console.log('Service Worker: Syncing offline chat messages...')
    
    const offlineMessages = await getOfflineChatMessages()
    
    for (const message of offlineMessages) {
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        })
        
        if (response.ok) {
          await removeOfflineChatMessage(message.id)
          console.log('Service Worker: Chat message synced successfully')
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync chat message', error)
      }
    }
  } catch (error) {
    console.error('Service Worker: Chat sync failed', error)
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event)
  
  const options = {
    body: 'AI Tempo has updates for you!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/open-24x24.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-24x24.png'
      }
    ]
  }
  
  if (event.data) {
    try {
      const payload = event.data.json()
      options.body = payload.body || options.body
      options.data = { ...options.data, ...payload.data }
    } catch (error) {
      console.error('Service Worker: Failed to parse push payload', error)
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('AI Tempo', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event)
  
  event.notification.close()
  
  if (event.action === 'dismiss') {
    return
  }
  
  // Open or focus the app
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      
      // Check if app is already open
      for (const client of clients) {
        if (client.url.includes(location.origin)) {
          await client.focus()
          return
        }
      }
      
      // Open new window
      const url = event.notification.data?.url || '/'
      await self.clients.openWindow(url)
    })()
  )
})

// Utility functions for offline data management
async function getOfflineProjects() {
  // In a real implementation, this would use IndexedDB
  return JSON.parse(localStorage.getItem('offline-projects') || '[]')
}

async function removeOfflineProject(projectId) {
  const projects = await getOfflineProjects()
  const filtered = projects.filter(p => p.id !== projectId)
  localStorage.setItem('offline-projects', JSON.stringify(filtered))
}

async function getOfflineChatMessages() {
  return JSON.parse(localStorage.getItem('offline-chat-messages') || '[]')
}

async function removeOfflineChatMessage(messageId) {
  const messages = await getOfflineChatMessages()
  const filtered = messages.filter(m => m.id !== messageId)
  localStorage.setItem('offline-chat-messages', JSON.stringify(filtered))
}

// Share target handling
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  if (url.pathname === '/share' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request))
  }
})

async function handleShareTarget(request) {
  try {
    const formData = await request.formData()
    const title = formData.get('title') || ''
    const text = formData.get('text') || ''
    const files = formData.getAll('files')
    
    // Store shared content for the app to process
    const sharedContent = {
      title,
      text,
      files: files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      })),
      timestamp: Date.now()
    }
    
    localStorage.setItem('shared-content', JSON.stringify(sharedContent))
    
    // Redirect to the app
    return Response.redirect('/?shared=true', 302)
  } catch (error) {
    console.error('Service Worker: Share handling failed', error)
    return Response.redirect('/', 302)
  }
}

console.log('Service Worker: Loaded successfully')