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
        'performance',
        'react hooks',
        'state management',
        'api client',
        'persistence',
        'optimization'
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
    installation: {
        title: 'Installation',
        description: 'Install Qortex in your React or vanilla JavaScript project. Choose between qortex-react for React apps or qortex-core for other frameworks.',
        url: '/docs/installation',
        keywords: ['installation', 'qortex-react', 'qortex-core', 'npm', 'yarn', 'pnpm'],
    },
    quickStart: {
        title: 'Quick Start',
        description: 'Get up and running with Qortex in minutes. Learn the basics of data fetching, caching, and React integration.',
        url: '/docs/quick-start',
        keywords: ['quick start', 'tutorial', 'getting started', 'react hooks', 'useQuery'],
    },
    useQuery: {
        title: 'useQuery Hook',
        description: 'The main React hook for reactive data fetching with automatic re-renders, caching, and error handling.',
        url: '/docs/useQuery',
        keywords: ['useQuery', 'react hook', 'data fetching', 'caching', 'error handling'],
    },
    coreApis: {
        title: 'Core APIs',
        description: 'Core APIs for data fetching, cache management, and query operations. Includes registerFetcher, fetchQuery, and more.',
        url: '/docs/core-apis',
        keywords: ['core apis', 'registerFetcher', 'fetchQuery', 'getQueryData', 'setQueryData'],
    },
    persistence: {
        title: 'Persistence',
        description: 'Persist query cache data across sessions with localStorage, sessionStorage, or custom storage backends.',
        url: '/docs/persistence',
        keywords: ['persistence', 'localStorage', 'sessionStorage', 'createPersister', 'cache'],
    },
    types: {
        title: 'Types',
        description: 'TypeScript type definitions for Qortex. QueryKey, QueryOptions, QueryState, and other essential types.',
        url: '/docs/types',
        keywords: ['types', 'typescript', 'QueryKey', 'QueryOptions', 'QueryState', 'type definitions'],
    },
}
