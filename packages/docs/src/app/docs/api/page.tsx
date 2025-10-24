import { Code, Zap, Settings, Database, HardDrive } from 'lucide-react'
import { generateMetadata as generateSEOMetadata, seoConfigs } from '@/lib/seo'

export const metadata = generateSEOMetadata(seoConfigs.api)

const apiSections = [
    {
        title: 'Core API',
        description: 'Framework-agnostic query management functions',
        icon: Database,
        items: [
            {
                name: 'registerFetcher(key, options)',
                description: 'Register a data fetcher function for a specific query key',
                parameters: [
                    { name: 'key', type: 'string | string[]', description: 'Query key (string or array)' },
                    { name: 'options', type: 'FetcherOptions<T>', description: 'Fetcher configuration options' }
                ],
                example: `import { registerFetcher } from "qortex-core";

registerFetcher(["users"], {
  fetcher: async () => {
    const response = await fetch("/api/users");
    return response.json();
  },
  staleTime: 5 * 60 * 1000,
  placeholderData: [],
  equalityStrategy: "deep" // or "shallow"
});`
            },
            {
                name: 'setQueryData(key, data)',
                description: 'Manually update query data',
                parameters: [
                    { name: 'key', type: 'string | string[]', description: 'Query key' },
                    { name: 'data', type: 'T', description: 'New data to set' }
                ],
                example: `import { setQueryData } from "qortex-core";

// Direct update
setQueryData(["todos"], newTodos);`
            },
            {
                name: 'fetchQuery(key, options?)',
                description: 'Execute a fetch operation with proper error handling and state management',
                parameters: [
                    { name: 'key', type: 'string | string[]', description: 'Query key' },
                    { name: 'options', type: 'QueryOptions<T>', description: 'Optional query configuration' }
                ],
                example: `import { fetchQuery } from "qortex-core";

// Fetch data manually
const userData = await fetchQuery(["user", userId]);

// With options
const userData = await fetchQuery(["user", userId], {
  staleTime: 10 * 60 * 1000
});`
            },
            {
                name: 'getQueryData(key, options?)',
                description: 'Get current query data without subscribing to updates',
                parameters: [
                    { name: 'key', type: 'string | string[]', description: 'Query key' },
                    { name: 'options', type: 'QueryOptions<T>', description: 'Optional query configuration' }
                ],
                example: `import { getQueryData } from "qortex-core";

const user = getQueryData(["user", userId]);
const isAuthenticated = getQueryData(["auth", "isAuthenticated"]);`
            },
            {
                name: 'getQueryState(key, options?)',
                description: 'Get comprehensive query state including computed flags',
                parameters: [
                    { name: 'key', type: 'string | string[]', description: 'Query key' },
                    { name: 'options', type: 'QueryOptions<T>', description: 'Optional query configuration' }
                ],
                example: `import { getQueryState } from "qortex-core";

const state = getQueryState(["users"]);
console.log({
  data: state.data,
  isLoading: state.isLoading,
  isFetching: state.isFetching,
  isError: state.isError,
  isStale: state.isStale
});`
            },
            {
                name: 'invalidateQuery(key)',
                description: 'Mark a query as invalidated, triggering refetch',
                parameters: [
                    { name: 'key', type: 'string | string[]', description: 'Query key to invalidate' }
                ],
                example: `import { invalidateQuery } from "qortex-core";

// Invalidate and refetch
invalidateQuery(["users"]);

// Invalidate specific user
invalidateQuery(["user", userId]);`
            },
            {
                name: 'subscribeQuery(key, callback, options?)',
                description: 'Subscribe to query state changes with flexible callback signatures',
                parameters: [
                    { name: 'key', type: 'string | string[]', description: 'Query key' },
                    { name: 'callback', type: '(state: QueryState<T>) => void', description: 'Callback function that receives current state' },
                    { name: 'options', type: 'QueryOptions<T>', description: 'Optional query configuration' }
                ],
                example: `import { subscribeQuery } from "qortex-core";

// Callback receives the current state
const unsubscribe = subscribeQuery(
  ["users"],
  (state) => {
    console.log("Query state changed:", state);
    console.log("Data:", state.data);
    console.log("Loading:", state.isLoading);
    console.log("Success:", state.isSuccess);
  }
);

// With fetcher for automatic type inference
const unsubscribe = subscribeQuery(
  ["users"],
  (state) => {
    console.log("Users:", state.data); // Automatically typed
  },
  { fetcher: fetchUsers }
);

// Cleanup subscription
unsubscribe();`
            },
            {
                name: 'setDefaultConfig(config)',
                description: 'Set global default configuration for all queries',
                parameters: [
                    { name: 'config', type: 'DefaultConfig', description: 'Default configuration options' }
                ],
                example: `import { setDefaultConfig } from "qortex-core";

setDefaultConfig({
  staleTime: 5 * 60 * 1000,
  refetchOnSubscribe: "stale",
  throttleTime: 100,
  usePreviousDataOnError: false,
  equalityStrategy: "deep"
});`
            },
            {
                name: 'dangerClearCache()',
                description: '⚠️ DANGER: Clear all cached data and subscriptions (testing only)',
                parameters: [],
                warning: 'This method should ONLY be used in testing environments. Using this in production will cause all active queries to lose their data and subscriptions to break.',
                example: `import { dangerClearCache } from "qortex-core";

// ✅ Safe usage in tests
beforeEach(() => {
  dangerClearCache();
});

// ❌ Dangerous usage in production
// dangerClearCache(); // Don't do this!`
            }
        ]
    },
    {
        title: 'React Hooks',
        description: 'React-specific hooks for data fetching',
        icon: Zap,
        items: [
            {
                name: 'useQuery(key, options?)',
                description: 'React hook for query data with full state management',
                parameters: [
                    { name: 'key', type: 'string | string[]', description: 'Query key' },
                    { name: 'options', type: 'UseQueryOptions<T>', description: 'Optional query options' }
                ],
                returns: 'UseQueryResult<T>',
                example: `const { data, isLoading, isSuccess, isError, error, refetch } = useQuery(["todos"], {
  refetchOnSubscribe: "stale",
  enabled: true,
  staleTime: 10000
});`
            },
            {
                name: 'useQueryData(key, options?)',
                description: 'React hook for simple data access without loading states',
                parameters: [
                    { name: 'key', type: 'string | string[]', description: 'Query key' },
                    { name: 'options', type: 'UseQueryDataOptions<T>', description: 'Optional query options' }
                ],
                returns: 'T | undefined',
                example: `const todos = useQueryData(["todos"]);
const user = useQueryData(["user", userId]);`
            },
            {
                name: 'useQuerySelect(key, options?)',
                description: 'React hook with smart subscription - automatically optimizes re-renders by only subscribing to accessed properties',
                parameters: [
                    { name: 'key', type: 'string | string[]', description: 'Query key' },
                    { name: 'options', type: 'UseQueryOptions<T>', description: 'Optional query options' }
                ],
                returns: 'QueryState<T>',
                example: `// Component that only uses data - will NOT re-render when isError changes
function UserName() {
  const query = useQuerySelect(["user"], { fetcher: fetchUser });
  return <div>{query.data?.name}</div>;
}

// Component that only uses status - will NOT re-render when data changes
function LoadingStatus() {
  const query = useQuerySelect(["user"], { fetcher: fetchUser });
  return <div>{query.isLoading ? 'Loading...' : 'Done'}</div>;
}

// Component using both - will re-render when either data OR status changes
function UserCard() {
  const query = useQuerySelect(["user"], { fetcher: fetchUser });
  return (
    <div>
      <div>{query.data?.name}</div>
      <div>{query.isLoading ? 'Loading...' : 'Done'}</div>
    </div>
  );
}`,
                note: 'Note: useQuerySelect uses a Proxy object to track accessed properties and keeps the data twice for comparison to optimize re-renders.'
            }
        ]
    },
    {
        title: 'TypeScript Types',
        description: 'Type definitions and interfaces',
        icon: Code,
        items: [
            {
                name: 'QueryKey',
                description: 'Type for query keys - can be string or array of strings/numbers',
                example: `type QueryKey = string | readonly (string | number)[];

// Examples:
const key1: QueryKey = "users";
const key2: QueryKey = ["user", 123];
const key3: QueryKey = ["posts", "published", 2024];`
            },
            {
                name: 'Fetcher<T>',
                description: 'Type for data fetching functions',
                example: `type Fetcher<T = any> = () => Promise<T> | T;

// Examples:
const userFetcher: Fetcher<User[]> = async () => {
  const response = await fetch("/api/users");
  return response.json();
};

const syncFetcher: Fetcher<string> = () => "Hello World";`
            },
            {
                name: 'QueryOptions<T>',
                description: 'Configuration options for queries',
                example: `type QueryOptions<T = any> = {
  enabled?: boolean;
  refetchOnSubscribe?: "always" | "stale" | false;
  fetcher?: Fetcher<T>;
  equalityFn?: EqualityFn<T>;
  staleTime?: number;
  signal?: AbortSignal;
  placeholderData?: T;
  usePreviousDataOnError?: boolean;
  usePlaceholderOnError?: boolean;
};`
            },
            {
                name: 'QueryState<T>',
                description: 'Return type for query state',
                example: `type QueryState<T = any, E = Error> = {
  data?: T;
  error?: E;
  status: QueryStatus;
  updatedAt?: number;
  isStale: boolean;
  isPlaceholderData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => Promise<T>;
};`
            },
            {
                name: 'QueryStatus',
                description: 'Possible query status values',
                example: `type QueryStatus = "idle" | "fetching" | "success" | "error";

// Usage in components:
const { status } = useQuery(["users"]);
if (status === "fetching") return <Spinner />;
if (status === "error") return <ErrorMessage />;
if (status === "success") return <DataComponent />;`
            },
            {
                name: 'EqualityFn<T>',
                description: 'Function type for data equality comparison',
                example: `type EqualityFn<T = any> = (a: T | undefined, b: T | undefined) => boolean;

// Example custom equality function:
const arrayEquality: EqualityFn<User[]> = (a, b) => {
  return a?.length === b?.length && 
         a?.every((user, index) => user.id === b?.[index]?.id);
};`
            },
            {
                name: 'EqualityStrategy',
                description: 'Built-in equality comparison strategies - persists across all API calls',
                example: `type EqualityStrategy = "shallow" | "deep";

// Shallow equality (default): compares only top-level properties
// Deep equality: recursively compares nested objects and arrays

// Usage:
registerFetcher(["users"], {
  fetcher: fetchUsers,
  equalityStrategy: "deep" // or "shallow"
});

// The strategy is automatically reused in all other API calls:
setQueryData(["users"], newData); // Uses "deep" strategy
getQueryData(["users"]);          // Uses "deep" strategy
getQueryState(["users"]);         // Uses "deep" strategy`
            },
            {
                name: 'DefaultConfig',
                description: 'Global configuration options',
                example: `type DefaultConfig = {
  enabled?: boolean;
  refetchOnSubscribe?: "always" | "stale" | false;
  staleTime?: number;
  usePreviousDataOnError?: boolean;
  usePlaceholderOnError?: boolean;
  equalityFn?: EqualityFn<any>;
  equalityStrategy?: "shallow" | "deep";
  throttleTime?: number;
};`
            }
        ]
    },
    {
        title: 'Utility Functions',
        description: 'Helper functions and utilities',
        icon: Settings,
        items: [
            {
                name: 'serializeKey(key)',
                description: 'Convert query key to string for internal use',
                parameters: [
                    { name: 'key', type: 'QueryKey', description: 'Query key to serialize' }
                ],
                example: `import { serializeKey } from "qortex-core";

const key1 = serializeKey("users"); // "users"
const key2 = serializeKey(["user", 123]); // "user,123"
const key3 = serializeKey(["posts", "published"]); // "posts,published"`
            }
        ]
    },
    {
        title: 'Configuration',
        description: 'Configuration options and types',
        icon: Settings,
        items: [
            {
                name: 'FetcherOptions<T>',
                description: 'Options for registering a fetcher',
                properties: [
                    { name: 'fetcher', type: 'Fetcher<T>', description: 'Function that fetches data' },
                    { name: 'staleTime?', type: 'number', description: 'Time before data is considered stale (ms)' },
                    { name: 'placeholderData?', type: 'T', description: 'Data to show while loading' },
                    { name: 'equalityFn?', type: '(a: T, b: T) => boolean', description: 'Function to compare data equality' },
                    { name: 'equalityStrategy?', type: '"shallow" | "deep"', description: 'Strategy for data equality comparison - persists across all API calls (default: "shallow")' }
                ]
            },
            {
                name: 'UseQueryOptions<T>',
                description: 'Options for useQuery hook',
                properties: [
                    { name: 'refetchOnSubscribe?', type: '"stale" | "always" | false', description: 'When to refetch on subscription' },
                    { name: 'enabled?', type: 'boolean', description: 'Whether the query is enabled' },
                    { name: 'staleTime?', type: 'number', description: 'Time before data is considered stale' },
                    { name: 'equalityStrategy?', type: '"shallow" | "deep"', description: 'Strategy for data equality comparison - persists across all API calls (default: "shallow")' },
                    { name: 'placeholderData?', type: 'T', description: 'Data to show while loading' }
                ]
            },
            {
                name: 'DefaultConfig',
                description: 'Global default configuration',
                properties: [
                    { name: 'staleTime?', type: 'number', description: 'Default stale time for all queries' },
                    { name: 'refetchOnSubscribe?', type: '"stale" | "always" | false', description: 'Default refetch behavior' },
                    { name: 'throttleTime?', type: 'number', description: 'Default throttle time for duplicate requests' },
                    { name: 'usePreviousDataOnError?', type: 'boolean', description: 'Keep previous data on error' },
                    { name: 'equalityStrategy?', type: '"shallow" | "deep"', description: 'Default equality strategy for all queries' },
                    { name: 'persister?', type: 'Persister', description: 'Persister instance for data persistence' }
                ],
                example: `// Core package (tree-shakable)
import { setDefaultConfig } from "qortex-core";
import { createPersister } from "qortex-core/persister";

// React package (with separate persister)
import { setDefaultConfig } from "qortex-react";
import { createPersister } from "qortex-react/persister";

setDefaultConfig({
  staleTime: 5 * 60 * 1000,
  refetchOnSubscribe: "stale",
  persister: createPersister('local', {
    burstKey: 'v1.0.0',
    prefix: 'my_app'
  })
});`
            }
        ]
    },
    {
        title: 'Data Persistence',
        description: 'Persister functions for localStorage and sessionStorage',
        icon: HardDrive,
        items: [
            {
                name: 'createPersister(type, config?)',
                description: 'Create a persister instance for data persistence',
                parameters: [
                    { name: 'type', type: '"local" | "session"', description: 'Storage type - localStorage or sessionStorage' },
                    { name: 'config', type: 'PersisterConfig', description: 'Optional persister configuration' }
                ],
                returns: 'Persister | undefined',
                example: `import { createPersister } from "qortex-core/persister";

// Basic localStorage persister
const persister = createPersister('local');

// With custom configuration
const persister = createPersister('local', {
  burstKey: 'v1.0.0',
  prefix: 'my_app',
  debounceTime: 50
});

// Session storage for temporary data
const sessionPersister = createPersister('session', {
  prefix: 'temp_data',
  debounceTime: 200
});`
            },
            {
                name: 'PersisterConfig',
                description: 'Configuration options for persister instances',
                properties: [
                    { name: 'burstKey?', type: 'string', description: 'Version key for cache invalidation. When changed, existing cached data will be cleared. Defaults to current Qortex version.' },
                    { name: 'prefix?', type: 'string', description: 'Storage key prefix for namespacing persisted data. Defaults to "qortex".' },
                    { name: 'debounceTime?', type: 'number', description: 'Debounce time in milliseconds for sync operations. Defaults to 100ms.' }
                ],
                example: `const config: PersisterConfig = {
  burstKey: 'v1.0.0',
  prefix: 'my_app',
  debounceTime: 50
};`
            },
            {
                name: 'Persister',
                description: 'Interface for persister instances',
                properties: [
                    { name: 'burstKey', type: 'string', description: 'The current burst key for cache invalidation' },
                    { name: 'storageKey', type: 'string', description: 'The storage key prefix being used' }
                ],
                methods: [
                    { name: 'save(state)', description: 'Saves serialized query state data to storage' },
                    { name: 'load(cache)', description: 'Loads and hydrates query state data from storage' },
                    { name: 'clear()', description: 'Clears all persisted data from storage' },
                    { name: 'sync(cache)', description: 'Debounced sync operation that saves current cache state' }
                ],
                example: `const persister = createPersister('local');

// The persister is automatically used by the query manager
// when set via setDefaultConfig({ persister })`
            }
        ]
    }
]

export default function APIPage() {
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        <span className="gradient-text">API Reference</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Complete API reference for qortex-core and qortex-react. All functions, hooks, and configuration options.
                    </p>
                </div>

                {apiSections.map((section) => (
                    <div key={section.title} className="mb-16">
                        <div className="flex items-center mb-8">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                                <section.icon className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                                <p className="text-gray-600">{section.description}</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {section.items.map((item) => (
                                <div key={item.name} className="card">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 font-mono">
                                            {item.name}
                                        </h3>
                                        <p className="mt-2 text-gray-600">{item.description}</p>
                                    </div>

                                    {'parameters' in item && item.parameters && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Parameters:</h4>
                                            <div className="space-y-2">
                                                {item.parameters.map((param) => (
                                                    <div key={param.name} className="flex items-start">
                                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-primary-600">
                                                            {param.name}
                                                        </code>
                                                        <span className="text-sm text-gray-500 ml-2">({param.type})</span>
                                                        <span className="text-sm text-gray-600 ml-2">{param.description}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {'returns' in item && item.returns && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Returns:</h4>
                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-primary-600">
                                                {item.returns}
                                            </code>
                                        </div>
                                    )}

                                    {'properties' in item && item.properties && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Properties:</h4>
                                            <div className="space-y-2">
                                                {item.properties.map((prop) => (
                                                    <div key={prop.name} className="flex items-start">
                                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-primary-600">
                                                            {prop.name}
                                                        </code>
                                                        <span className="text-sm text-gray-500 ml-2">({prop.type})</span>
                                                        <span className="text-sm text-gray-600 ml-2">{prop.description}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {'example' in item && item.example && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Example:</h4>
                                            <pre className="code-block">
                                                <code>{item.example}</code>
                                            </pre>
                                        </div>
                                    )}

                                    {'warning' in item && item.warning && (
                                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0">
                                                    <span className="text-red-400 text-lg">⚠️</span>
                                                </div>
                                                <div className="ml-3">
                                                    <h4 className="text-sm font-medium text-red-800 mb-1">Warning</h4>
                                                    <p className="text-sm text-red-700">{item.warning}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {'note' in item && item.note && (
                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0">
                                                    <span className="text-blue-400 text-lg">ℹ️</span>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-blue-700">{item.note}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* TypeScript Types */}
                <div className="mb-16">
                    <div className="flex items-center mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-100 text-accent-600">
                            <Code className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h2 className="text-2xl font-bold text-gray-900">TypeScript Types</h2>
                            <p className="text-gray-600">Type definitions for better development experience</p>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Types</h3>
                        <pre className="code-block">
                            <code>{`// Core types
type Fetcher<T> = (key: string | string[]) => Promise<T>;
type EqualityFn<T> = (a: T, b: T) => boolean;

// Query result types
interface UseQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  status: 'idle' | 'fetching' | 'success' | 'error';
  isStale: boolean;
  updatedAt: number | null;
  isPlaceholderData: boolean;
}

// Configuration types
interface FetcherOptions<T> {
  fetcher: Fetcher<T>;
  staleTime?: number;
  placeholderData?: T;
  equalityFn?: EqualityFn<T>;
}

interface UseQueryOptions<T> {
  refetchOnSubscribe?: 'stale' | 'always' | false;
  enabled?: boolean;
  fetcher?: Fetcher<T>;
  staleTime?: number;
  placeholderData?: T;
  usePreviousDataOnError?: boolean;
  usePlaceholderOnError?: boolean;
}`}</code>
                        </pre>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-primary-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Need More Help?</h2>
                    <p className="text-gray-600 mb-4">
                        Check out our guides and examples to learn more about using qortex effectively.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="/docs/basic-usage"
                            className="btn-primary"
                        >
                            Basic Usage Guide
                        </a>
                        <a
                            href="/docs/configuration"
                            className="btn-secondary"
                        >
                            Configuration Guide
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}