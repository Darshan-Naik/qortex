import { Metadata } from 'next'
import { Shield, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Error Handling',
  description: 'Learn how to handle errors effectively in qortex. Best practices for error states, retry logic, and fallback data.',
}

const errorPatterns = [
  {
    title: 'Basic Error Handling',
    description: 'Handle errors with proper loading and error states',
    icon: AlertTriangle,
    code: `function TodosList() {
  const { data, isLoading, error, refetch } = useQuery(["todos"]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {data?.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}`,
  },
  {
    title: 'Graceful Degradation',
    description: 'Show placeholder data while handling errors gracefully',
    icon: Shield,
    code: `function ProductList() {
  const { data: products, error } = useQuery(["products"], {
    placeholderData: [], // Show empty list while loading
    usePlaceholderOnError: true // Show empty list on error
  });

  return (
    <div>
      {error && (
        <div className="error-banner">
          ⚠️ Some products couldn't be loaded, showing cached data
        </div>
      )}
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}`,
  },
  {
    title: 'Retry Logic',
    description: 'Implement retry logic with exponential backoff',
    icon: RefreshCw,
    code: `function DataComponent() {
  const [retryCount, setRetryCount] = useState(0);
  
  const { data, error, refetch } = useQuery(["data"], {
    enabled: retryCount < 3 // Stop retrying after 3 attempts
  });

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    await refetch();
  };

  if (error && retryCount < 3) {
    return (
      <div>
        <p>❌ Something went wrong: {error.message}</p>
        <button onClick={handleRetry}>
          🔄 Try Again ({retryCount}/3)
        </button>
      </div>
    );
  }

  return <div>{/* Your content */}</div>;
}`,
  },
  {
    title: 'Fallback Data',
    description: 'Provide meaningful fallback data for better UX',
    icon: CheckCircle,
    code: `function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useQuery(["user", userId], {
    placeholderData: {
      name: "Loading...",
      avatar: "/default-avatar.png",
      bio: "User information is being loaded..."
    },
    usePlaceholderOnError: true
  });

  return (
    <div>
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
    </div>
  );
}`,
  },
]

const errorTypes = [
  {
    type: 'Network Errors',
    description: 'Connection issues, timeouts, and network failures',
    handling: 'Retry with exponential backoff, show offline indicator',
    example: 'Failed to fetch data from server'
  },
  {
    type: 'HTTP Errors',
    description: '4xx and 5xx status codes from API responses',
    handling: 'Handle specific status codes, show appropriate messages',
    example: '404 Not Found, 500 Internal Server Error'
  },
  {
    type: 'Validation Errors',
    description: 'Data validation failures and malformed responses',
    handling: 'Show validation messages, highlight problematic fields',
    example: 'Invalid email format, required field missing'
  },
  {
    type: 'Authentication Errors',
    description: 'Unauthorized access and token expiration',
    handling: 'Redirect to login, refresh tokens, clear sensitive data',
    example: '401 Unauthorized, 403 Forbidden'
  }
]

export default function ErrorHandlingPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            <span className="gradient-text">Error Handling</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Learn how to handle errors effectively in qortex. Best practices for error states, retry logic, and fallback data.
          </p>
        </div>

        {/* Error Patterns */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Error Handling Patterns</h2>
          <div className="space-y-8">
            {errorPatterns.map((pattern) => (
              <div key={pattern.title} className="card">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                      <pattern.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{pattern.title}</h3>
                    <p className="text-gray-600 mb-4">{pattern.description}</p>
                    <pre className="code-block">
                      <code>{pattern.code}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Types */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Common Error Types</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handling Strategy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Example
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {errorTypes.map((error, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {error.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {error.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {error.handling}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {error.example}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Practices */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Best Practices</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Do</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Always provide meaningful error messages</li>
                <li>• Use placeholder data for better UX</li>
                <li>• Implement retry logic with limits</li>
                <li>• Show loading states during retries</li>
                <li>• Log errors for debugging</li>
                <li>• Handle network connectivity issues</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">❌ Don't</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Show technical error messages to users</li>
                <li>• Retry indefinitely without limits</li>
                <li>• Ignore error states in UI</li>
                <li>• Leave users without feedback</li>
                <li>• Forget to handle edge cases</li>
                <li>• Expose sensitive information in errors</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Configuration Options */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Error Handling Configuration</h2>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Configuration</h3>
            <pre className="code-block">
              <code>{`// Set global error handling defaults
queryManager.setDefaultConfig({
  usePreviousDataOnError: true, // Keep previous data on error
  usePlaceholderOnError: false, // Don't use placeholder on error
  staleTime: 5 * 60 * 1000, // 5 minutes stale time
});

// Per-query error handling
queryManager.registerFetcher(["critical-data"], {
  fetcher: async () => {
    const response = await fetch("/api/critical-data");
    if (!response.ok) throw new Error('Failed to fetch critical data');
    return response.json();
  },
  placeholderData: { status: 'loading' },
  usePlaceholderOnError: true // Override global setting
});`}</code>
            </pre>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-primary-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready to Handle Errors?</h2>
          <p className="text-gray-600 mb-4">
            Now that you understand error handling patterns, explore more advanced features and configuration options.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/docs/configuration"
              className="btn-primary"
            >
              Configuration Guide
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
