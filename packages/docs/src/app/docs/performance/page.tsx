import { Metadata } from 'next'
import { Zap, Cpu, Database, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Performance Tips',
    description: 'Optimize your qortex usage for maximum performance. Best practices for caching, bundle size, and efficient data fetching.',
}

const performanceTips = [
    {
        title: 'Optimize Bundle Size',
        description: 'Keep your bundle size minimal by importing only what you need',
        icon: Zap,
        code: `// ✅ Good - Import only what you need
import { useQuery } from "qortex-react";
import { registerFetcher } from "qortex-core";

// ❌ Avoid - Don't import everything
import * as qortex from "qortex-react";`,
    },
    {
        title: 'Use Appropriate Stale Times',
        description: 'Set stale times based on your data characteristics',
        icon: Cpu,
        code: `// Short-lived data (real-time)
registerFetcher(["live-data"], {
  fetcher: fetchLiveData,
  staleTime: 0 // Always stale
});

// Long-lived data (user profiles)
registerFetcher(["user-profile"], {
  fetcher: fetchUserProfile,
  staleTime: 5 * 60 * 1000 // 5 minutes
});

// Static data (configuration)
registerFetcher(["config"], {
  fetcher: fetchConfig,
  staleTime: 30 * 60 * 1000 // 30 minutes
});`,
    },
    {
        title: 'Batch Related Queries',
        description: 'Fetch related data in parallel for better performance',
        icon: Database,
        code: `function Dashboard() {
  // These will be fetched in parallel
  const { data: user } = useQuery(["user"]);
  const { data: posts } = useQuery(["posts"]);
  const { data: comments } = useQuery(["comments"]);

  return (
    <div>
      <UserProfile user={user} />
      <PostsList posts={posts} />
      <CommentsList comments={comments} />
    </div>
  );
}`,
    },
    {
        title: 'Use Placeholder Data',
        description: 'Provide meaningful placeholder data to prevent layout shifts',
        icon: TrendingUp,
        code: `// Provide placeholder data for better UX
registerFetcher(["todos"], {
  fetcher: fetchTodos,
  placeholderData: [] // Empty array while loading
});

registerFetcher(["user"], {
  fetcher: fetchUser,
  placeholderData: {
    name: "Loading...",
    avatar: "/default-avatar.png"
  }
});`,
    },
]

const optimizationStrategies = [
    {
        category: 'Caching',
        strategies: [
            'Set appropriate stale times based on data freshness requirements',
            'Use placeholder data to prevent loading states',
            'Enable previous data on error for better UX',
            'Configure equality functions for complex data structures'
        ]
    },
    {
        category: 'Network',
        strategies: [
            'Batch related API calls when possible',
            'Use request deduplication to prevent duplicate calls',
            'Implement proper error handling and retry logic',
            'Consider using background refetching for non-critical data'
        ]
    },
    {
        category: 'Bundle Size',
        strategies: [
            'Import only the functions you need',
            'Use tree-shaking friendly imports',
            'Avoid importing the entire library',
            'Consider code splitting for large applications'
        ]
    },
    {
        category: 'Memory',
        strategies: [
            'Clear unused queries when components unmount',
            'Use appropriate cache sizes for your use case',
            'Monitor memory usage in development',
            'Implement proper cleanup in useEffect hooks'
        ]
    }
]

const performanceMetrics = [
    {
        metric: 'Bundle Size',
        value: '< 2KB',
        description: 'Total gzipped size including qortex-core and qortex-react'
    },
    {
        metric: 'First Load',
        value: '< 100ms',
        description: 'Time to first query execution'
    },
    {
        metric: 'Cache Hit Rate',
        value: '> 90%',
        description: 'Percentage of requests served from cache'
    },
    {
        metric: 'Memory Usage',
        value: '< 1MB',
        description: 'Typical memory footprint for 100 queries'
    }
]

export default function PerformancePage() {
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        <span className="gradient-text">Performance Tips</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Optimize your qortex usage for maximum performance. Best practices for caching, bundle size, and efficient data fetching.
                    </p>
                </div>

                {/* Performance Tips */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Performance Optimization Tips</h2>
                    <div className="space-y-8">
                        {performanceTips.map((tip) => (
                            <div key={tip.title} className="card">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                                            <tip.icon className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{tip.title}</h3>
                                        <p className="text-gray-600 mb-4">{tip.description}</p>
                                        <pre className="code-block">
                                            <code>{tip.code}</code>
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Optimization Strategies */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Optimization Strategies</h2>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {optimizationStrategies.map((strategy) => (
                            <div key={strategy.category} className="card">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{strategy.category}</h3>
                                <ul className="space-y-2">
                                    {strategy.strategies.map((item, index) => (
                                        <li key={index} className="text-gray-600 flex items-start">
                                            <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Performance Metrics</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {performanceMetrics.map((metric) => (
                            <div key={metric.metric} className="card text-center">
                                <div className="text-2xl font-bold text-primary-600 mb-2">{metric.value}</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{metric.metric}</h3>
                                <p className="text-sm text-gray-600">{metric.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Best Practices */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Best Practices</h2>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Do</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Set appropriate stale times for your data</li>
                                <li>• Use placeholder data to prevent layout shifts</li>
                                <li>• Batch related queries when possible</li>
                                <li>• Import only what you need</li>
                                <li>• Monitor performance in development</li>
                                <li>• Use background refetching for non-critical data</li>
                            </ul>
                        </div>
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">❌ Don't</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Set stale time too low for static data</li>
                                <li>• Import the entire library unnecessarily</li>
                                <li>• Ignore memory usage in large applications</li>
                                <li>• Fetch data sequentially when parallel is possible</li>
                                <li>• Forget to provide placeholder data</li>
                                <li>• Over-fetch data that won't be used</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-primary-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready to Optimize?</h2>
                    <p className="text-gray-600 mb-4">
                        Now that you understand performance optimization, explore more advanced features and configuration options.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="/docs/configuration"
                            className="btn-primary"
                        >
                            Configuration Guide
                        </a>
                        <a
                            href="/docs/error-handling"
                            className="btn-secondary"
                        >
                            Error Handling
                        </a>
                        <a
                            href="/docs/api"
                            className="btn-secondary"
                        >
                            API Reference
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
