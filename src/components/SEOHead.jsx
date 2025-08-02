import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

const SEOHead = ({ 
  title, 
  description, 
  keywords = [], 
  image, 
  type = 'website',
  canonical,
  noindex = false 
}) => {
  const location = useLocation()
  
  // Default SEO values
  const defaultTitle = "AI Tempo - Transform Ideas into Apps Through Conversation"
  const defaultDescription = "Build production-ready applications through natural conversation with AI. Multi-agent collaboration, visual programming, and instant deployment. Start building for free."
  const defaultImage = `${window.location.origin}/images/og-default.jpg`
  const siteUrl = window.location.origin
  
  // Construct full values
  const fullTitle = title ? `${title} - AI Tempo` : defaultTitle
  const seoDescription = description || defaultDescription
  const seoImage = image || defaultImage
  const canonicalUrl = canonical || `${siteUrl}${location.pathname}`
  const seoKeywords = keywords.length > 0 ? keywords.join(', ') : 'AI development platform, natural language programming, AI-powered coding, conversation to code, AI agents, visual programming'
  
  // Update document title
  useEffect(() => {
    document.title = fullTitle
  }, [fullTitle])

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}
      <meta name="language" content="en" />
      <meta name="author" content="AI Tempo Platform" />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:site_name" content="AI Tempo Platform" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={seoDescription} />
      <meta property="twitter:image" content={seoImage} />
      <meta property="twitter:site" content="@aitempo" />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AI Tempo Platform",
          "applicationCategory": "DeveloperApplication",
          "description": defaultDescription,
          "operatingSystem": "Web Browser",
          "url": siteUrl,
          "author": {
            "@type": "Organization",
            "name": "AI Tempo"
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "1247"
          }
        })}
      </script>
    </Helmet>
  )
}

export default SEOHead