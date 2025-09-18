import { Metadata } from 'next'
import { Code, Zap, Shield, RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Basic Usage',
  description: 'Learn the fundamentals of using qortex in your React applications. Get started with basic patterns and best practices.',
}

const usageExamples = [
  {
    title: 'Simple Data Fetching',
    description: 'Basic usage of useQuery hook for fetching data',
    icon: Code,
    code: `import { registerFetcher, useQuery } from "qortex-react";

// Register a fetcher
registerFetcher(["users"], {
  fetcher: async () => {
    const response = await fetch("/api/users");
    return response.json();
  }
});

// Use in component
function UsersList() {
  const { data, isLoading, isSuccess, isError, error } = useQuery(["users"]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;
  if (isSuccess && data) {
    return (
      <ul>
        {data.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    );
  }
  return <div>No users found</div>;
}`,
  },
  {
    title: 'With Parameters',
    description: 'Fetching data with dynamic parameters',
    icon: Zap,
    code: `import { registerFetcher, useQuery } from "qortex-react";

// Register fetcher with parameters
registerFetcher(["user", "id"], {
  fetcher: async (key) => {
    const [, , userId] = key;
    const response = await fetch(\`/api/users/\${userId}\`);
    return response.json();
  }
});

// Use with parameters
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, isSuccess, isError, error } = useQuery(["user", "id", userId]);

  if (isLoading) return <div>Loading user...</div>;
  if (isError) return <div>Error: {error?.message}</div>;
  if (isSuccess && user) {
    return (
      <div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    );
  }
  return <div>User not found</div>;
}`,
  },
  {
    title: 'Error Handling',
    description: 'Proper error handling and fallback data',
    icon: Shield,
    code: `function TodosList() {
  const { data, isLoading, isSuccess, isError, error, refetch } = useQuery(["todos"], {
    placeholderData: [], // Show empty list while loading
    usePlaceholderOnError: true // Keep placeholder on error
  });

  if (isLoading) return <div>Loading todos...</div>;

  return (
    <div>
      {isError && (
        <div className="error-banner">
          <p>Error: {error?.message}</p>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      )}
      {isSuccess && data && (
        <ul>
          {data.map(todo => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}`,
  },
  {
    title: 'Background Updates',
    description: 'Automatic background refetching and cache management',
    icon: RefreshCw,
    code: `// Configure for background updates
registerFetcher(["live-data"], {
  fetcher: async () => {
    const response = await fetch("/api/live-data");
    return response.json();
  },
  staleTime: 0 // Always consider stale for live data
});

function LiveData() {
  const { data, isFetching, isSuccess, isError, error } = useQuery(["live-data"], {
    refetchOnSubscribe: "always" // Refetch on every subscription
  });

  return (
    <div>
      {isFetching && <div className="loading-indicator">Updating...</div>}
      {isError && <div className="error">Error: {error?.message}</div>}
      {isSuccess && data && <div>Live data: {data.value}</div>}
    </div>
  );
}`,
  },
]

const patterns = [
  {
    title: 'Global Configuration',
    description: 'Set default options for all queries',
    code: `setDefaultConfig({
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnSubscribe: "stale",
  throttleTime: 100,
  usePreviousDataOnError: true
});`,
  },
  {
    title: 'Simple Data Access',
    description: 'Use useQueryData for simple data access without loading states',
    code: `import { useQueryData } from "qortex-react";

function UserCount() {
  const users = useQueryData(["users"]);
  return <div>Total users: {users?.length || 0}</div>;
}`,
  },
  {
    title: 'Manual Data Updates',
    description: 'Update data manually from anywhere in your app',
    code: `import { setQueryData } from "qortex-core";

// Update data directly
setQueryData(["todos"], newTodos);

// Functional update
setQueryData(["todos"], (oldData) => [
  ...(oldData || []),
  newTodo
]);`,
  },
]

export default function BasicUsagePage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            <span className="gradient-text">Basic Usage</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Learn the fundamental patterns and best practices for using qortex in your React applications.
          </p>
        </div>

        {/* Usage Examples */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Common Usage Patterns</h2>
          <div className="space-y-8">
            {usageExamples.map((example) => (
              <div key={example.title} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                      <example.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{example.title}</h3>
                    <p className="mt-2 text-gray-600">{example.description}</p>
                    <div className="mt-4">
                      <pre className="code-block">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Patterns */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Additional Patterns</h2>
          <div className="space-y-6">
            {patterns.map((pattern) => (
              <div key={pattern.title} className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{pattern.title}</h3>
                <p className="text-gray-600 mb-4">{pattern.description}</p>
                <pre className="code-block">
                  <code>{pattern.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Best Practices */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Best Practices</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Do</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Use array keys for parameters</li>
                <li>• Set appropriate stale times</li>
                <li>• Provide placeholder data</li>
                <li>• Handle loading and error states</li>
                <li>• Use TypeScript for type safety</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">❌ Don't</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Use string keys with parameters</li>
                <li>• Ignore error handling</li>
                <li>• Set stale time too low</li>
                <li>• Forget to register fetchers</li>
                <li>• Mix different data fetching libraries</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-primary-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready for More?</h2>
          <p className="text-gray-600 mb-4">
            Now that you understand the basics, explore advanced features and configuration options.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/docs/configuration"
              className="btn-primary"
            >
              Configuration Guide
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
