'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  canonicalUrl?: string
  ogImage?: string
  noIndex?: boolean
  structuredData?: Record<string, unknown>
}

export function useSEO(config: SEOConfig) {
  const router = useRouter()

  useEffect(() => {
    // Update document title
    if (config.title) {
      document.title = `${config.title} | Mbaye Transport`
    }

    // Update meta description
    if (config.description) {
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', config.description)
    }

    // Update meta keywords
    if (config.keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', config.keywords.join(', '))
    }

    // Update canonical URL
    if (config.canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.setAttribute('rel', 'canonical')
        document.head.appendChild(canonical)
      }
      canonical.href = config.canonicalUrl
    }

    // Update Open Graph image
    if (config.ogImage) {
      let ogImageMeta = document.querySelector('meta[property="og:image"]')
      if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta')
        ogImageMeta.setAttribute('property', 'og:image')
        document.head.appendChild(ogImageMeta)
      }
      ogImageMeta.setAttribute('content', config.ogImage)
    }

    // Update robots meta
    if (config.noIndex) {
      let robotsMeta = document.querySelector('meta[name="robots"]')
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta')
        robotsMeta.setAttribute('name', 'robots')
        document.head.appendChild(robotsMeta)
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow')
    }

    // Update structured data
    if (config.structuredData) {
      let structuredDataScript = document.querySelector('#structured-data')
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script')
        structuredDataScript.id = 'structured-data'
        structuredDataScript.type = 'application/ld+json'
        document.head.appendChild(structuredDataScript)
      }
      structuredDataScript.textContent = JSON.stringify(config.structuredData)
    }
  }, [config])

  return {
    updateSEO: (newConfig: Partial<SEOConfig>) => {
      // This would trigger a re-render with updated config
      // Implementation depends on how you want to handle state updates
    }
  }
}

export function usePageTracking() {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Track page views
      if (typeof window !== 'undefined') {
        // Example: Google Analytics
        if ('gtag' in window) {
          (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
            page_location: url,
            page_title: document.title
          })
        }

        // Example: Other analytics services
        console.debug(`Page view: ${url}`)
      }
    }

    // Track initial page load
    handleRouteChange(window.location.pathname)
  }, [router])
}

export function useStructuredData() {
  const addStructuredData = (data: Record<string, unknown>, id = 'structured-data') => {
    if (typeof document === 'undefined') return

    let script = document.getElementById(id)
    if (!script) {
      script = document.createElement('script')
      script.id = id
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(data)
  }

  const removeStructuredData = (id = 'structured-data') => {
    if (typeof document === 'undefined') return
    
    const script = document.getElementById(id)
    if (script) {
      script.remove()
    }
  }

  return {
    addStructuredData,
    removeStructuredData
  }
}