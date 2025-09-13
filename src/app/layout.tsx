import type { Metadata } from "next";
import "./globals.css";
import { ErrorBoundary } from '@/components/common/error-boundary'

export const metadata: Metadata = {
  title: "Sénégal Driver - Transport Premium au Sénégal",
  description: "Service de transport privé premium au Sénégal. Chauffeur expérimenté, véhicules confortables, tarifs transparents. Réservez votre voyage dès maintenant.",
  keywords: ["transport Sénégal", "chauffeur privé", "voyage Sénégal", "tourisme", "Dakar", "Saint-Louis"],
  authors: [{ name: "Sénégal Driver" }],
  creator: "Sénégal Driver",
  publisher: "Sénégal Driver",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://senegal-driver.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Sénégal Driver - Transport Premium au Sénégal",
    description: "Service de transport privé premium au Sénégal avec chauffeur expérimenté",
    url: '/',
    siteName: 'Sénégal Driver',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/images/senegal-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Transport au Sénégal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Sénégal Driver - Transport Premium au Sénégal",
    description: "Service de transport privé premium au Sénégal avec chauffeur expérimenté",
    images: ['/images/senegal-1.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

// Performance monitoring script
const PerformanceScript = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
        // Initialize performance monitoring
        if (typeof window !== 'undefined') {
          // Critical resource hints
          const criticalResources = [
            '/images/senegal-1.jpg',
            '/images/senegal-2.jpg'
          ];
          
          criticalResources.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
          });

          // Service worker registration
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                  console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                  console.log('SW registration failed: ', registrationError);
                });
            });
          }

          // Performance observer for Core Web Vitals
          const vitalsData = {};
          
          function sendToAnalytics(metric) {
            vitalsData[metric.name] = metric.value;
            
            // Send to console in development
            if (process.env.NODE_ENV === 'development') {
              console.log('Core Web Vital:', {
                name: metric.name,
                value: metric.value,
                rating: metric.rating || 'unknown'
              });
            }
            
            // Send to analytics endpoint
            if (navigator.sendBeacon) {
              navigator.sendBeacon('/api/analytics/vitals', JSON.stringify({
                name: metric.name,
                value: metric.value,
                id: metric.id,
                delta: metric.delta,
                url: location.href,
                timestamp: Date.now()
              }));
            }
          }

          // Load web-vitals library dynamically
          import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(sendToAnalytics);
            getFID(sendToAnalytics);
            getFCP(sendToAnalytics);
            getLCP(sendToAnalytics);
            getTTFB(sendToAnalytics);
          }).catch(error => {
            console.warn('Web Vitals loading failed:', error);
          });

          // Resource timing analysis
          function analyzeResourceTiming() {
            if (!performance.getEntriesByType) return;
            
            const resources = performance.getEntriesByType('resource');
            const analysis = {
              totalResources: resources.length,
              totalSize: 0,
              slowResources: [],
              largeResources: []
            };

            resources.forEach(resource => {
              const size = resource.transferSize || 0;
              const duration = resource.duration;
              
              analysis.totalSize += size;
              
              if (duration > 1000) {
                analysis.slowResources.push({
                  name: resource.name,
                  duration: Math.round(duration)
                });
              }
              
              if (size > 100000) {
                analysis.largeResources.push({
                  name: resource.name,
                  size: Math.round(size / 1024)
                });
              }
            });

            if (process.env.NODE_ENV === 'development') {
              console.group('Resource Analysis');
              console.log('Total resources:', analysis.totalResources);
              console.log('Total size:', Math.round(analysis.totalSize / 1024), 'KB');
              if (analysis.slowResources.length) {
                console.warn('Slow resources (>1s):', analysis.slowResources);
              }
              if (analysis.largeResources.length) {
                console.warn('Large resources (>100KB):', analysis.largeResources);
              }
              console.groupEnd();
            }
          }

          // Run analysis after load
          window.addEventListener('load', () => {
            setTimeout(analyzeResourceTiming, 2000);
          });

          // Monitor memory usage
          function monitorMemory() {
            if (performance.memory) {
              const memory = performance.memory;
              const memoryInfo = {
                used: Math.round(memory.usedJSHeapSize / 1048576),
                total: Math.round(memory.totalJSHeapSize / 1048576),
                limit: Math.round(memory.jsHeapSizeLimit / 1048576)
              };
              
              if (process.env.NODE_ENV === 'development') {
                console.log('Memory usage:', memoryInfo.used + 'MB / ' + memoryInfo.total + 'MB');
              }
              
              // Warn if memory usage is high
              if (memoryInfo.used > 100) {
                console.warn('High memory usage detected:', memoryInfo.used + 'MB');
              }
            }
          }

          // Monitor memory every 30 seconds in development
          if (process.env.NODE_ENV === 'development') {
            setInterval(monitorMemory, 30000);
          }
        }
      `,
    }}
  />
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        {/* Critical CSS and fonts preload */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external services */}
        <link rel="dns-prefetch" href="//api.groq.com" />
        <link rel="dns-prefetch" href="//api.openai.com" />
        
        {/* Resource hints for critical images */}
        <link
          rel="preload"
          href="/images/senegal-1.jpg"
          as="image"
          type="image/jpeg"
        />
        
        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#2563eb" />
        
        {/* Viewport with performance optimizations */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        
        <PerformanceScript />
      </head>
      <body className="antialiased bg-white text-gray-900 font-sans">
        <ErrorBoundary>
          {/* Skip to content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 transition-all"
          >
            Aller au contenu principal
          </a>
          
          {/* Main content */}
          <div id="main-content">
            {children}
          </div>
          
          {/* Performance monitoring overlay for development */}
          {process.env.NODE_ENV === 'development' && (
            <div
              id="perf-monitor"
              className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white text-xs p-2 rounded z-50 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
            >
              <div>Performance Monitor</div>
              <div id="fps-counter">FPS: --</div>
              <div id="memory-usage">Memory: --</div>
            </div>
          )}
        </ErrorBoundary>
        
        {/* Development performance monitoring */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // FPS counter for development
                let fps = 0;
                let lastTime = performance.now();
                let frameCount = 0;
                
                function updateFPS() {
                  frameCount++;
                  const currentTime = performance.now();
                  
                  if (currentTime - lastTime >= 1000) {
                    fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                    
                    const fpsElement = document.getElementById('fps-counter');
                    if (fpsElement) {
                      fpsElement.textContent = 'FPS: ' + fps;
                      fpsElement.style.color = fps < 30 ? '#ef4444' : fps < 50 ? '#f59e0b' : '#10b981';
                    }
                    
                    lastTime = currentTime;
                    frameCount = 0;
                  }
                  
                  requestAnimationFrame(updateFPS);
                }
                
                updateFPS();
                
                // Memory usage updater
                setInterval(() => {
                  if (performance.memory) {
                    const used = Math.round(performance.memory.usedJSHeapSize / 1048576);
                    const memoryElement = document.getElementById('memory-usage');
                    if (memoryElement) {
                      memoryElement.textContent = 'Memory: ' + used + 'MB';
                      memoryElement.style.color = used > 100 ? '#ef4444' : used > 50 ? '#f59e0b' : '#10b981';
                    }
                  }
                }, 5000);
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}