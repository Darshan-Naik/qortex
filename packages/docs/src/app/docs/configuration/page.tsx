import { Metadata } from 'next'
import { Settings, Clock, RefreshCw, Shield } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Configuration',
    description: 'Learn how to configure qortex for optimal performance and behavior. Global defaults, per-query options, and best practices.',
}

const configOptions = [
    {
        title: 'Global Defaults',
        description: 'Set default configuration for all queries',
        icon: Settings,
        code: `import { queryManager } from "qortex-core";

// Set global defaults
queryManager.setDefaultConfig({
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnSubscribe: "stale",
  throttleTime: 100,
  usePreviousDataOnError: true,
  usePlaceholderOnError: false,
  equalityFn: shallowEqual
});`,
        options: [
            { name: 'staleTime', type: 'number', default: '0', description: 'Time before data is considered stale (ms)' },
            { name: 'refetchOnSubscribe', type: '"stale" | "always" | false', default: '"stale"', description: 'When to refetch on subscription' },
            { name: 'throttleTime', type: 'number', default: '50', description: 'Throttle time for duplicate requests (ms)' },
            { name: 'usePreviousDataOnError', type: 'boolean', default: 'true', description: 'Keep previous data when errors occur' },
            { name: 'usePlaceholderOnError', type: 'boolean', default: 'false', description: 'Use placeholder data on errors' },
            { name: 'equalityFn', type: 'EqualityFn<any>', default: 'Object.is', description: 'Function to compare data equality' }
        ]
    },
    {
        title: 'Per-Query Configuration',
        description: 'Override defaults for specific queries',
        icon: Clock,
        code: `// Register fetcher with custom options
queryManager.registerFetcher(["live-data"], {
  fetcher: async () => {
    const response = await fetch("/api/live-data");
    return response.json();
  },
  staleTime: 0, // Always stale for live data
  placeholderData: { value: 0, timestamp: Date.now() }
});

// Use with additional options
const { data } = useQuery(["live-data"], {
  refetchOnSubscribe: "always", // Override global default
  enabled: isOnline // Conditional fetching
});`,
        options: [
            { name: 'staleTime', type: 'number', description: 'Override global stale time' },
            { name: 'placeholderData', type: 'T', description: 'Data to show while loading' },
            { name: 'equalityFn', type: 'EqualityFn<T>', description: 'Custom equality function' }
        ]
    },
    {
        title: 'Cache Management',
        description: 'Control caching behavior and data updates',
        icon: RefreshCw,
        code: `// Manual data updates
queryManager.setQueryData(["todos"], newTodos);

// Functional updates
queryManager.setQueryData(["todos"], (oldData) => [
  ...(oldData || []),
  newTodo
]);

// Get current data
const currentTodos = queryManager.getQueryData(["todos"]);

// Clear specific query
queryManager.clearQuery(["todos"]);

// Clear all queries
queryManager.clearAllQueries();`,
        options: [
            { name: 'setQueryData', type: 'function', description: 'Manually update query data' },
            { name: 'getQueryData', type: 'function', description: 'Get current query data' },
            { name: 'clearQuery', type: 'function', description: 'Clear specific query cache' },
            { name: 'clearAllQueries', type: 'function', description: 'Clear all query caches' }
        ]
    },
    {
        title: 'Error Handling',
        description: 'Configure error handling and retry behavior',
        icon: Shield,
        code: `// Global error handling
queryManager.setDefaultConfig({
  usePreviousDataOnError: true, // Keep previous data
  usePlaceholderOnError: false  // Don't use placeholder on error
});

// Per-query error handling
queryManager.registerFetcher(["critical-data"], {
  fetcher: async () => {
    const response = await fetch("/api/critical-data");
    if (!response.ok) throw new Error('Failed to fetch critical data');
    return response.json();
  },
  placeholderData: { status: 'loading' },
  usePlaceholderOnError: true // Use placeholder on error
});

// In component
const { data, error, refetch } = useQuery(["critical-data"], {
  usePreviousDataOnError: false // Override for this query
});`,
        options: [
            { name: 'usePreviousDataOnError', type: 'boolean', description: 'Keep previous data when errors occur' },
            { name: 'usePlaceholderOnError', type: 'boolean', description: 'Use placeholder data on errors' },
            { name: 'placeholderData', type: 'T', description: 'Fallback data for loading/error states' }
        ]
    }
]

const bestPractices = [
    {
        title: 'Stale Time Configuration',
        description: 'Set appropriate stale times based on data characteristics',
        examples: [
            { type: 'User Profile', staleTime: '5 * 60 * 1000', reason: 'Changes infrequently' },
            { type: 'Live Data', staleTime: '0', reason: 'Always needs fresh data' },
            { type: 'Static Content', staleTime: '30 * 60 * 1000', reason: 'Rarely changes' },
            { type: 'Search Results', staleTime: '2 * 60 * 1000', reason: 'Moderate update frequency' }
        ]
    },
    {
        title: 'Throttle Time Optimization',
        description: 'Balance between responsiveness and performance',
        examples: [
            { type: 'User Input', throttleTime: '300', reason: 'Debounce user interactions' },
            { type: 'API Calls', throttleTime: '100', reason: 'Prevent duplicate requests' },
            { type: 'Real-time', throttleTime: '50', reason: 'Minimal delay for live data' }
        ]
    },
    {
        title: 'Placeholder Data Strategy',
        description: 'Provide meaningful fallback data for better UX',
        examples: [
            { type: 'Lists', placeholderData: '[]', reason: 'Show empty state while loading' },
            { type: 'Objects', placeholderData: '{}', reason: 'Prevent undefined errors' },
            { type: 'Numbers', placeholderData: '0', reason: 'Provide default numeric value' }
        ]
    }
]

export default function ConfigurationPage() {
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        <span className="gradient-text">Configuration</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Learn how to configure qortex for optimal performance and behavior. Global defaults, per-query options, and best practices.
                    </p>
                </div>

                {/* Configuration Options */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Configuration Options</h2>
                    <div className="space-y-12">
                        {configOptions.map((config) => (
                            <div key={config.title} className="card">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                                            <config.icon className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{config.title}</h3>
                                        <p className="text-gray-600 mb-4">{config.description}</p>

                                        <div className="mb-4">
                                            <pre className="code-block">
                                                <code>{config.code}</code>
                                            </pre>
                                        </div>

                                        {config.options && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">Options:</h4>
                                                <div className="space-y-2">
                                                    {config.options.map((option) => (
                                                        <div key={option.name} className="flex items-start">
                                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-primary-600">
                                                                {option.name}
                                                            </code>
                                                            <span className="text-sm text-gray-500 ml-2">({option.type})</span>
                                                            {'default' in option && option.default && (
                                                                <span className="text-sm text-gray-400 ml-2">default: {option.default}</span>
                                                            )}
                                                            <span className="text-sm text-gray-600 ml-2">{option.description}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Best Practices */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Best Practices</h2>
                    <div className="space-y-8">
                        {bestPractices.map((practice) => (
                            <div key={practice.title} className="card">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{practice.title}</h3>
                                <p className="text-gray-600 mb-4">{practice.description}</p>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Value
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Reason
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {practice.examples.map((example, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                        {example.type}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-500 font-mono">
                                                        {'staleTime' in example ? example.staleTime :
                                                            'throttleTime' in example ? example.throttleTime :
                                                                'placeholderData' in example ? example.placeholderData : ''}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                        {example.reason}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Tips */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Performance Tips</h2>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Do</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Set appropriate stale times for your data</li>
                                <li>• Use placeholder data to prevent layout shifts</li>
                                <li>• Configure throttle time to prevent duplicate requests</li>
                                <li>• Use equality functions for complex data structures</li>
                                <li>• Enable previous data on error for better UX</li>
                            </ul>
                        </div>
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">❌ Don't</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Set stale time too low for static data</li>
                                <li>• Ignore error handling configuration</li>
                                <li>• Use heavy equality functions unnecessarily</li>
                                <li>• Disable throttling for high-frequency updates</li>
                                <li>• Forget to provide placeholder data</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-primary-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready to Configure?</h2>
                    <p className="text-gray-600 mb-4">
                        Now that you understand configuration options, explore more advanced features and patterns.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="/docs/error-handling"
                            className="btn-primary"
                        >
                            Error Handling Guide
                        </a>
                        <a
                            href="/docs/performance"
                            className="btn-secondary"
                        >
                            Performance Tips
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
