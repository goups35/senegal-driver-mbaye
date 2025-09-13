// Service Worker for senegal-driver-mvp
// Provides offline capability and caching optimizations

const CACHE_NAME = 'senegal-driver-v1.0.0'
const STATIC_CACHE = 'static-v1.0.0'
const DYNAMIC_CACHE = 'dynamic-v1.0.0'
const IMAGE_CACHE = 'images-v1.0.0'
const API_CACHE = 'api-v1.0.0'

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  // Add critical static assets
  '/images/picto-2.svg',
  // Fonts and critical CSS will be added by Next.js automatically
]

// API endpoints to cache
const CACHEABLE_APIs = [
  '/api/distances',
  '/api/distances-senegal',
  '/api/v1/health'
]

// Network-first strategies for these paths
const NETWORK_FIRST = [
  '/api/trips/quote',
  '/api/chat',
  '/api/ai-expert'
]

// Installation event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Skip waiting')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error)
      })
  )
})

// Activation event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== IMAGE_CACHE && 
              cacheName !== API_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
    .then(() => {
      console.log('Service Worker: Claiming clients')
      return self.clients.claim()
    })
  )
})

// Fetch event - main caching logic
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return
  }

  // Handle different types of requests
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request))
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request))
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticRequest(request))
  } else {
    event.respondWith(handlePageRequest(request))
  }
})

// Request type detection
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(request.url)
}

function isAPIRequest(request) {
  return request.url.includes('/api/')
}

function isStaticAsset(request) {
  return request.destination === 'script' ||
         request.destination === 'style' ||
         request.url.includes('/_next/static/')
}

// Image handling - Cache first with fallback
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.warn('Image request failed:', request.url)
    
    // Return offline placeholder for images
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#f3f4f6"/>
        <text x="100" y="100" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="14">
          Image indisponible
        </text>
      </svg>`,
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        }
      }
    )
  }
}

// API handling - Different strategies based on endpoint
async function handleAPIRequest(request) {
  const url = new URL(request.url)
  const pathname = url.pathname
  
  // Network-first for dynamic APIs
  if (NETWORK_FIRST.some(path => pathname.includes(path))) {
    return handleNetworkFirst(request, API_CACHE)
  }
  
  // Cache-first for stable APIs
  if (CACHEABLE_APIs.some(path => pathname.includes(path))) {
    return handleCacheFirst(request, API_CACHE, 5 * 60 * 1000) // 5 minutes
  }
  
  // Default: network-only for other APIs
  try {
    return await fetch(request)
  } catch (error) {
    console.warn('API request failed:', request.url)
    return new Response(
      JSON.stringify({ error: 'Service indisponible temporairement' }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Static asset handling - Cache first with network update
async function handleStaticRequest(request) {
  return handleCacheFirst(request, STATIC_CACHE)
}

// Page handling - Network first with cache fallback
async function handlePageRequest(request) {
  return handleNetworkFirst(request, DYNAMIC_CACHE)
}

// Caching strategies
async function handleCacheFirst(request, cacheName, maxAge = Infinity) {
  try {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    // Check if cached response is still valid
    if (cachedResponse) {
      const cacheTime = cachedResponse.headers.get('sw-cache-time')
      if (cacheTime && Date.now() - parseInt(cacheTime) < maxAge) {
        return cachedResponse
      }
    }
    
    // Fetch from network
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone()
      responseToCache.headers.set('sw-cache-time', Date.now().toString())
      cache.put(request, responseToCache)
    }
    
    return networkResponse
  } catch (error) {
    console.warn('Cache-first strategy failed:', request.url)
    
    // Return cached version if available
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline')
    }
    
    throw error
  }
}

async function handleNetworkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.warn('Network-first strategy failed:', request.url)
    
    // Fallback to cache
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline') || new Response('Page indisponible hors ligne', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
    
    throw error
  }
}

// Background sync for API calls
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  console.log('Service Worker: Background sync triggered')
  
  try {
    // Retry failed API calls stored in IndexedDB
    const failedRequests = await getFailedRequests()
    
    for (const request of failedRequests) {
      try {
        await fetch(request.url, request.options)
        await removeFailedRequest(request.id)
        console.log('Background sync: Request retried successfully', request.url)
      } catch (error) {
        console.warn('Background sync: Request still failing', request.url)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// IndexedDB helpers for background sync
async function getFailedRequests() {
  // Simplified implementation - in real app, use IndexedDB
  return []
}

async function removeFailedRequest(id) {
  // Simplified implementation - in real app, use IndexedDB
  return Promise.resolve()
}

// Cache cleanup on message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_CLEANUP') {
    event.waitUntil(cleanupCaches())
  }
})

async function cleanupCaches() {
  const cacheNames = await caches.keys()
  
  return Promise.all(
    cacheNames.map(async (cacheName) => {
      const cache = await caches.open(cacheName)
      const requests = await cache.keys()
      
      // Remove old entries (older than 1 day for images, 1 hour for API)
      const maxAge = cacheName.includes('image') ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000
      
      return Promise.all(
        requests.map(async (request) => {
          const response = await cache.match(request)
          const cacheTime = response?.headers.get('sw-cache-time')
          
          if (cacheTime && Date.now() - parseInt(cacheTime) > maxAge) {
            return cache.delete(request)
          }
        })
      )
    })
  )
}

// Performance monitoring
self.addEventListener('fetch', (event) => {
  const startTime = performance.now()
  
  event.respondWith(
    event.respondWith.then((response) => {
      const duration = performance.now() - startTime
      
      // Log slow requests
      if (duration > 1000) {
        console.warn(`Slow request: ${event.request.url} took ${duration}ms`)
      }
      
      return response
    })
  )
})

console.log('Service Worker: Loaded and ready')