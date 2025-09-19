import type { Metadata } from 'next'

interface SEOConfig {
    title: string
    description: string
    keywords?: string[]
    url?: string
    image?: string
    type?: 'website' | 'article'
}

export function generateMetadata({
    title,
    description,
    keywords = [],
    url,
    image = '/og-image.png',
    type = 'website'
}: SEOConfig): Metadata {
    const fullTitle = title.includes('Qortex') ? title : `${title} | Qortex`
    const fullUrl = url ? `https://qortex.darshannaik.com${url}` : 'https://qortex.darshannaik.com'

    const defaultKeywords = [
        'Qortex',
        'qortex',
        'qortex-core',
        'qortex-react',
        'data fetching',
        'react',
        'typescript',
        'cache',
        'query',
        'performance'
    ]

    return {
        title: fullTitle,
        description,
        keywords: [...defaultKeywords, ...keywords],
        openGraph: {
            title: fullTitle,
            description,
            url: fullUrl,
            type,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: fullTitle,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [image],
        },
        alternates: {
            canonical: fullUrl,
        },
    }
}

// Predefined SEO configurations for common pages
export const seoConfigs = {
    home: {
        title: 'Qortex - Minimal, Performant Data Fetching Library',
        description: 'A minimal, performant data fetching library with React integration. Built for simplicity, efficiency, and developer happiness! Get started with Qortex today.',
        url: '/',
    },
    features: {
        title: 'Features',
        description: 'Discover Qortex features: intelligent caching, React integration, TypeScript support, and performance optimizations.',
        url: '/docs/features',
        keywords: ['features', 'caching', 'react hooks', 'typescript'],
    },
    gettingStarted: {
        title: 'Getting Started',
        description: 'Learn how to get started with Qortex in minutes. Installation, basic usage, and first steps with our data fetching library.',
        url: '/docs/getting-started',
        keywords: ['installation', 'getting started', 'tutorial', 'quick start'],
    },
    api: {
        title: 'API Reference',
        description: 'Complete API reference for Qortex. Documentation for all methods, hooks, and configuration options.',
        url: '/docs/api',
        keywords: ['api', 'reference', 'documentation', 'methods', 'hooks'],
    },
    performance: {
        title: 'Performance',
        description: 'Learn about Qortex performance optimizations, caching strategies, and best practices for efficient data fetching.',
        url: '/docs/performance',
        keywords: ['performance', 'optimization', 'caching', 'best practices'],
    },
}
