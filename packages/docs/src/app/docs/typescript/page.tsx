import { Metadata } from 'next'
import { Code, Type, CheckCircle, Zap } from 'lucide-react'

export const metadata: Metadata = {
    title: 'TypeScript Support',
    description: 'Learn how to use qortex with TypeScript for type-safe data fetching. Type definitions, generics, and best practices.',
}

const typescriptExamples = [
    {
        title: 'Basic TypeScript Usage',
        description: 'Define types for your data and get full type safety',
        icon: Type,
        code: `interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Type-safe fetcher
queryManager.registerFetcher<User[]>(["users"], {
  fetcher: async (): Promise<User[]> => {
    const response = await fetch("/api/users");
    return response.json();
  }
});

// Type-safe hook usage
function UsersList() {
  const { data: users, isLoading, error } = useQuery<User[]>(["users"]);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>
          {user.name} - {user.email}
        </li>
      ))}
    </ul>
  );
}`,
    },
    {
        title: 'Generic Type Parameters',
        description: 'Use generics for flexible type-safe data fetching',
        icon: Code,
        code: `// Generic API response type
interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// Type-safe API calls
async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const result: ApiResponse<T> = await response.json();
  
  if (result.status === 'error') {
    throw new Error(result.message || 'API Error');
  }
  
  return result.data;
}

// Register typed fetchers
queryManager.registerFetcher<User[]>(["users"], {
  fetcher: () => fetchApi<User[]>("/api/users")
});

queryManager.registerFetcher<Post[]>(["posts"], {
  fetcher: () => fetchApi<Post[]>("/api/posts")
});`,
    },
    {
        title: 'Complex Data Types',
        description: 'Handle complex nested data structures with TypeScript',
        icon: CheckCircle,
        code: `interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface PostWithComments extends Post {
  comments: Comment[];
}

// Type-safe fetcher with complex data
queryManager.registerFetcher<PostWithComments>(["post", "id"], {
  fetcher: async (key): Promise<PostWithComments> => {
    const [, , postId] = key;
    const response = await fetch(\`/api/posts/\${postId}?include=comments\`);
    return response.json();
  }
});

// Type-safe component
function PostDetail({ postId }: { postId: string }) {
  const { data: post, isLoading } = useQuery<PostWithComments>(["post", "id", postId]);
  
  if (isLoading) return <div>Loading post...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <article>
      <h1>{post.title}</h1>
      <p>By {post.author.name}</p>
      <div>{post.content}</div>
      <div>
        <h3>Comments ({post.comments.length})</h3>
        {post.comments.map(comment => (
          <div key={comment.id}>
            <strong>{comment.author.name}:</strong> {comment.content}
          </div>
        ))}
      </div>
    </article>
  );
}`,
    },
    {
        title: 'Type-Safe Configuration',
        description: 'Configure qortex with full type safety',
        icon: Zap,
        code: `// Type-safe configuration
interface AppConfig {
  apiUrl: string;
  timeout: number;
  retries: number;
}

// Type-safe default config
queryManager.setDefaultConfig({
  staleTime: 5 * 60 * 1000,
  refetchOnSubscribe: "stale" as const,
  throttleTime: 100,
  usePreviousDataOnError: true,
  equalityFn: (a: unknown, b: unknown) => {
    return JSON.stringify(a) === JSON.stringify(b);
  }
});

// Type-safe fetcher options
queryManager.registerFetcher<User[]>(["users"], {
  fetcher: async (): Promise<User[]> => {
    const response = await fetch("/api/users");
    return response.json();
  },
  staleTime: 10 * 60 * 1000, // 10 minutes
  placeholderData: [] as User[],
  equalityFn: (a: User[], b: User[]) => {
    return a.length === b.length && 
           a.every((user, index) => user.id === b[index]?.id);
  }
});`,
    },
]

const typeDefinitions = [
    {
        name: 'Fetcher<T>',
        description: 'Function type for data fetching',
        definition: 'type Fetcher<T> = (key: string | string[]) => Promise<T>;'
    },
    {
        name: 'EqualityFn<T>',
        description: 'Function type for data equality comparison',
        definition: 'type EqualityFn<T> = (a: T, b: T) => boolean;'
    },
    {
        name: 'UseQueryResult<T>',
        description: 'Return type of useQuery hook',
        definition: `interface UseQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  status: 'idle' | 'fetching' | 'success' | 'error';
  isStale: boolean;
  updatedAt: number | null;
  isPlaceholderData: boolean;
}`
    },
    {
        name: 'FetcherOptions<T>',
        description: 'Options for registering a fetcher',
        definition: `interface FetcherOptions<T> {
  fetcher: Fetcher<T>;
  staleTime?: number;
  placeholderData?: T;
  equalityFn?: EqualityFn<T>;
}`
    }
]

export default function TypeScriptPage() {
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        <span className="gradient-text">TypeScript Support</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Learn how to use qortex with TypeScript for type-safe data fetching. Type definitions, generics, and best practices.
                    </p>
                </div>

                {/* TypeScript Examples */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">TypeScript Examples</h2>
                    <div className="space-y-8">
                        {typescriptExamples.map((example) => (
                            <div key={example.title} className="card">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                                            <example.icon className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{example.title}</h3>
                                        <p className="text-gray-600 mb-4">{example.description}</p>
                                        <pre className="code-block">
                                            <code>{example.code}</code>
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Type Definitions */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Type Definitions</h2>
                    <div className="space-y-6">
                        {typeDefinitions.map((type) => (
                            <div key={type.name} className="card">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-mono">
                                    {type.name}
                                </h3>
                                <p className="text-gray-600 mb-4">{type.description}</p>
                                <pre className="code-block">
                                    <code>{type.definition}</code>
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Best Practices */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">TypeScript Best Practices</h2>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Do</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Define interfaces for your data structures</li>
                                <li>• Use generic type parameters for flexibility</li>
                                <li>• Provide type annotations for fetcher functions</li>
                                <li>• Use const assertions for literal types</li>
                                <li>• Define custom equality functions with proper types</li>
                                <li>• Use type guards for runtime type checking</li>
                            </ul>
                        </div>
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">❌ Don't</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Use 'any' type unnecessarily</li>
                                <li>• Ignore TypeScript errors</li>
                                <li>• Forget to type your API responses</li>
                                <li>• Use type assertions without validation</li>
                                <li>• Mix different data types in the same query</li>
                                <li>• Skip type definitions for complex data</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Type Safety Benefits */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Type Safety Benefits</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="card text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 mx-auto mb-4">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Compile-time Safety</h3>
                            <p className="text-gray-600">Catch errors before runtime with TypeScript's type checking</p>
                        </div>
                        <div className="card text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 mx-auto mb-4">
                                <Code className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Better IntelliSense</h3>
                            <p className="text-gray-600">Get autocomplete and documentation in your IDE</p>
                        </div>
                        <div className="card text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 mx-auto mb-4">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Refactoring Safety</h3>
                            <p className="text-gray-600">Safely refactor code with confidence in type safety</p>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-primary-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready for Type Safety?</h2>
                    <p className="text-gray-600 mb-4">
                        Now that you understand TypeScript integration, explore more advanced features and configuration options.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="/docs/api"
                            className="btn-primary"
                        >
                            API Reference
                        </a>
                        <a
                            href="/docs/configuration"
                            className="btn-secondary"
                        >
                            Configuration Guide
                        </a>
                        <a
                            href="/docs/performance"
                            className="btn-secondary"
                        >
                            Performance Tips
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
