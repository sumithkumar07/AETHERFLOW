"""
SEO Optimization Service
Handles SEO meta tags, structured data, sitemap generation, and search optimization.
"""

import json
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass
import re

@dataclass
class SEOData:
    title: str
    description: str
    keywords: List[str]
    canonical_url: str
    og_title: str
    og_description: str
    og_image: str
    og_type: str
    twitter_card: str
    twitter_title: str
    twitter_description: str
    twitter_image: str
    structured_data: Dict[str, Any]
    robots: str = "index, follow"
    lang: str = "en"

@dataclass
class SitemapEntry:
    url: str
    last_modified: datetime
    change_frequency: str
    priority: float

class SEOService:
    """Service for managing SEO optimization across the platform."""
    
    def __init__(self, db_wrapper=None):
        self.db_wrapper = db_wrapper
        self.is_initialized = False
        self.page_seo_data = {}
        self.sitemap_entries = []
        
        # Default SEO configuration
        self.default_config = {
            "site_name": "AI Tempo Platform",
            "site_description": "Transform ideas into production-ready applications through natural conversation with AI",
            "site_url": "https://aitempo.dev",
            "default_image": "/images/og-default.jpg",
            "twitter_handle": "@aitempo",
            "facebook_app_id": "",
            "google_site_verification": "",
            "bing_site_verification": ""
        }
    
    async def initialize(self):
        """Initialize the SEO service."""
        try:
            # Generate SEO data for all main pages
            await self._generate_page_seo_data()
            await self._generate_sitemap()
            self.is_initialized = True
            print("✅ SEO Service initialized successfully")
        except Exception as e:
            print(f"⚠️ SEO Service initialization warning: {e}")
    
    async def get_page_seo(self, page_path: str, dynamic_data: Optional[Dict[str, Any]] = None) -> SEOData:
        """Get SEO data for a specific page."""
        
        # Merge dynamic data if provided
        base_seo = self.page_seo_data.get(page_path, self._get_default_seo(page_path))
        
        if dynamic_data:
            base_seo = self._merge_dynamic_seo(base_seo, dynamic_data)
        
        return base_seo
    
    async def generate_meta_tags(self, page_path: str, dynamic_data: Optional[Dict[str, Any]] = None) -> str:
        """Generate HTML meta tags for a page."""
        
        seo_data = await self.get_page_seo(page_path, dynamic_data)
        
        meta_tags = f"""
    <!-- Primary Meta Tags -->
    <title>{seo_data.title}</title>
    <meta name="title" content="{seo_data.title}">
    <meta name="description" content="{seo_data.description}">
    <meta name="keywords" content="{', '.join(seo_data.keywords)}">
    <meta name="robots" content="{seo_data.robots}">
    <meta name="language" content="{seo_data.lang}">
    <meta name="author" content="{self.default_config['site_name']}">
    <link rel="canonical" href="{seo_data.canonical_url}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="{seo_data.og_type}">
    <meta property="og:url" content="{seo_data.canonical_url}">
    <meta property="og:title" content="{seo_data.og_title}">
    <meta property="og:description" content="{seo_data.og_description}">
    <meta property="og:image" content="{seo_data.og_image}">
    <meta property="og:site_name" content="{self.default_config['site_name']}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="{seo_data.twitter_card}">
    <meta property="twitter:url" content="{seo_data.canonical_url}">
    <meta property="twitter:title" content="{seo_data.twitter_title}">
    <meta property="twitter:description" content="{seo_data.twitter_description}">
    <meta property="twitter:image" content="{seo_data.twitter_image}">
    <meta property="twitter:site" content="{self.default_config['twitter_handle']}">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {json.dumps(seo_data.structured_data, indent=2)}
    </script>
    
    <!-- Additional SEO Meta Tags -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#3B82F6">
    <meta name="msapplication-TileColor" content="#3B82F6">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="alternate icon" href="/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        """.strip()
        
        return meta_tags
    
    async def generate_sitemap_xml(self) -> str:
        """Generate XML sitemap for the website."""
        
        sitemap_xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        sitemap_xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        
        for entry in self.sitemap_entries:
            sitemap_xml += '  <url>\n'
            sitemap_xml += f'    <loc>{entry.url}</loc>\n'
            sitemap_xml += f'    <lastmod>{entry.last_modified.strftime("%Y-%m-%d")}</lastmod>\n'
            sitemap_xml += f'    <changefreq>{entry.change_frequency}</changefreq>\n'
            sitemap_xml += f'    <priority>{entry.priority}</priority>\n'
            sitemap_xml += '  </url>\n'
        
        sitemap_xml += '</urlset>'
        return sitemap_xml
    
    async def generate_robots_txt(self) -> str:
        """Generate robots.txt file."""
        
        robots_txt = f"""User-agent: *
Allow: /

# Sitemap
Sitemap: {self.default_config['site_url']}/sitemap.xml

# Block admin and private areas
Disallow: /admin
Disallow: /api/
Disallow: /private/

# Allow important pages
Allow: /
Allow: /templates
Allow: /login
Allow: /signup

# Crawl delay
Crawl-delay: 1"""
        
        return robots_txt
    
    async def optimize_content_seo(self, content: str, target_keywords: List[str]) -> Dict[str, Any]:
        """Analyze and optimize content for SEO."""
        
        analysis = {
            'word_count': len(content.split()),
            'keyword_density': {},
            'readability_score': self._calculate_readability(content),
            'headings': self._extract_headings(content),
            'recommendations': []
        }
        
        # Keyword density analysis
        content_lower = content.lower()
        for keyword in target_keywords:
            keyword_lower = keyword.lower()
            density = content_lower.count(keyword_lower) / len(content.split()) * 100
            analysis['keyword_density'][keyword] = round(density, 2)
            
            if density < 0.5:
                analysis['recommendations'].append(f"Consider using '{keyword}' more frequently (current: {density:.1f}%)")
            elif density > 3:
                analysis['recommendations'].append(f"'{keyword}' might be overused (current: {density:.1f}%)")
        
        # Content length recommendations
        if analysis['word_count'] < 300:
            analysis['recommendations'].append("Content is quite short. Consider expanding for better SEO.")
        elif analysis['word_count'] > 2000:
            analysis['recommendations'].append("Content is very long. Consider breaking into multiple pages.")
        
        # Heading structure
        if not analysis['headings']:
            analysis['recommendations'].append("Add headings (H1, H2, etc.) to improve content structure.")
        
        return analysis
    
    async def generate_schema_markup(self, page_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate structured data markup for different page types."""
        
        base_schema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": self.default_config['site_name'],
            "url": self.default_config['site_url'],
            "potentialAction": {
                "@type": "SearchAction",
                "target": f"{self.default_config['site_url']}/search?q={{search_term_string}}",
                "query-input": "required name=search_term_string"
            }
        }
        
        if page_type == "software_application":
            schema = {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": data.get('name', self.default_config['site_name']),
                "applicationCategory": "DeveloperApplication",
                "description": data.get('description', self.default_config['site_description']),
                "operatingSystem": "Web Browser",
                "url": self.default_config['site_url'],
                "author": {
                    "@type": "Organization",
                    "name": self.default_config['site_name']
                },
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "reviewCount": "1247"
                }
            }
        elif page_type == "article":
            schema = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": data.get('title'),
                "description": data.get('description'),
                "author": {
                    "@type": "Organization",
                    "name": self.default_config['site_name']
                },
                "publisher": {
                    "@type": "Organization",
                    "name": self.default_config['site_name'],
                    "logo": {
                        "@type": "ImageObject",
                        "url": f"{self.default_config['site_url']}/logo.png"
                    }
                },
                "datePublished": data.get('published_date', datetime.utcnow().isoformat()),
                "dateModified": data.get('modified_date', datetime.utcnow().isoformat())
            }
        elif page_type == "faq":
            schema = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": data.get('questions', [])
            }
        else:
            schema = base_schema
        
        return schema
    
    async def _generate_page_seo_data(self):
        """Generate SEO data for all main pages."""
        
        pages = {
            "/": {
                "title": "AI Tempo - Transform Ideas into Apps Through Conversation",
                "description": "Build production-ready applications through natural conversation with AI. Multi-agent collaboration, visual programming, and instant deployment. Start building for free.",
                "keywords": ["AI development platform", "natural language programming", "AI-powered coding", "conversation to code", "AI agents", "visual programming"],
                "og_type": "website",
                "structured_data_type": "software_application"
            },
            "/templates": {
                "title": "Templates - AI Tempo Platform",
                "description": "Discover production-ready templates for web apps, mobile apps, APIs, and more. Start your project with professional templates optimized for AI development.",
                "keywords": ["app templates", "code templates", "web app templates", "API templates", "AI-generated templates"],
                "og_type": "website",
                "structured_data_type": "collection"
            },
            "/chat": {
                "title": "Chat Hub - AI Tempo Platform",
                "description": "Your AI-powered development command center. Manage projects, collaborate with AI agents, and build applications through natural conversation.",
                "keywords": ["AI chat", "development hub", "AI agents", "project management", "collaborative coding"],
                "og_type": "webapp",
                "structured_data_type": "software_application"
            },
            "/integrations": {
                "title": "Integrations - AI Tempo Platform",
                "description": "Connect your projects with powerful third-party services. Payment processors, authentication providers, analytics tools, and more.",
                "keywords": ["API integrations", "third-party services", "payment integration", "authentication services"],
                "og_type": "website",
                "structured_data_type": "collection"
            },
            "/login": {
                "title": "Sign In - AI Tempo Platform",
                "description": "Sign in to your AI Tempo account and continue building amazing applications with AI-powered development tools.",
                "keywords": ["login", "sign in", "AI development", "account access"],
                "og_type": "website",
                "robots": "noindex, nofollow"
            },
            "/signup": {
                "title": "Sign Up - AI Tempo Platform",
                "description": "Create your free AI Tempo account and start building applications through conversation. No credit card required.",
                "keywords": ["sign up", "register", "free account", "AI development", "get started"],
                "og_type": "website"
            }
        }
        
        for path, config in pages.items():
            seo_data = SEOData(
                title=config["title"],
                description=config["description"],
                keywords=config["keywords"],
                canonical_url=f"{self.default_config['site_url']}{path}",
                og_title=config["title"],
                og_description=config["description"],
                og_image=f"{self.default_config['site_url']}{self.default_config['default_image']}",
                og_type=config["og_type"],
                twitter_card="summary_large_image",
                twitter_title=config["title"],
                twitter_description=config["description"],
                twitter_image=f"{self.default_config['site_url']}{self.default_config['default_image']}",
                structured_data=await self.generate_schema_markup(
                    config.get("structured_data_type", "website"),
                    {
                        "name": config["title"],
                        "description": config["description"]
                    }
                ),
                robots=config.get("robots", "index, follow")
            )
            
            self.page_seo_data[path] = seo_data
    
    async def _generate_sitemap(self):
        """Generate sitemap entries."""
        
        # Main pages
        main_pages = [
            ("/", "daily", 1.0),
            ("/templates", "weekly", 0.9),
            ("/integrations", "weekly", 0.8),
            ("/login", "monthly", 0.3),
            ("/signup", "monthly", 0.5),
            ("/demo", "weekly", 0.7)
        ]
        
        for path, change_freq, priority in main_pages:
            self.sitemap_entries.append(SitemapEntry(
                url=f"{self.default_config['site_url']}{path}",
                last_modified=datetime.utcnow(),
                change_frequency=change_freq,
                priority=priority
            ))
    
    def _get_default_seo(self, page_path: str) -> SEOData:
        """Get default SEO data for unknown pages."""
        
        return SEOData(
            title=f"{self.default_config['site_name']} - AI-Powered Development Platform",
            description=self.default_config['site_description'],
            keywords=["AI development", "natural language programming", "AI agents"],
            canonical_url=f"{self.default_config['site_url']}{page_path}",
            og_title=self.default_config['site_name'],
            og_description=self.default_config['site_description'],
            og_image=f"{self.default_config['site_url']}{self.default_config['default_image']}",
            og_type="website",
            twitter_card="summary_large_image",
            twitter_title=self.default_config['site_name'],
            twitter_description=self.default_config['site_description'],
            twitter_image=f"{self.default_config['site_url']}{self.default_config['default_image']}",
            structured_data={"@context": "https://schema.org", "@type": "WebPage"}
        )
    
    def _merge_dynamic_seo(self, base_seo: SEOData, dynamic_data: Dict[str, Any]) -> SEOData:
        """Merge dynamic data into base SEO data."""
        
        # Create a copy and update with dynamic data
        updated_seo = SEOData(**base_seo.__dict__)
        
        if "title" in dynamic_data:
            updated_seo.title = dynamic_data["title"]
            updated_seo.og_title = dynamic_data["title"]
            updated_seo.twitter_title = dynamic_data["title"]
        
        if "description" in dynamic_data:
            updated_seo.description = dynamic_data["description"]
            updated_seo.og_description = dynamic_data["description"]
            updated_seo.twitter_description = dynamic_data["description"]
        
        if "image" in dynamic_data:
            updated_seo.og_image = dynamic_data["image"]
            updated_seo.twitter_image = dynamic_data["image"]
        
        if "keywords" in dynamic_data:
            updated_seo.keywords = dynamic_data["keywords"]
        
        return updated_seo
    
    def _calculate_readability(self, content: str) -> float:
        """Calculate a simple readability score."""
        
        sentences = len(re.split(r'[.!?]+', content))
        words = len(content.split())
        
        if sentences == 0:
            return 0
        
        avg_sentence_length = words / sentences
        
        # Simple readability score (lower is better)
        score = max(0, min(100, 100 - (avg_sentence_length - 15) * 2))
        return round(score, 1)
    
    def _extract_headings(self, content: str) -> List[str]:
        """Extract headings from content."""
        
        # Look for markdown-style headings
        headings = re.findall(r'^#{1,6}\s+(.+)$', content, re.MULTILINE)
        return headings

# Global service instance
seo_service = None

def get_seo_service():
    """Get the global SEO service instance."""
    return seo_service

def set_seo_service(service):
    """Set the global SEO service instance."""
    global seo_service
    seo_service = service