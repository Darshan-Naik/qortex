import { Metadata } from 'next'
import { ArrowRight, CheckCircle, Code, Zap } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Getting Started',
    description: 'Get started with qortex in minutes. Learn the basics and build your first data fetching application.',
}

const steps = [
    {
        title: 'Install qortex',
        description: 'Choose the package that fits your framework',
        icon: CheckCircle,
        code: `# For React applications
npm install qortex-react

# For other frameworks (Vue, Svelte, vanilla JS)
npm install qortex-core

# Using pnpm or yarn
pnpm add qortex-react  # or qortex-core
yarn add qortex-react  # or qortex-core`,
    },
    {
        title: 'Set up your first fetcher',
        description: 'Register a fetcher function to define how data is fetched',
        icon: Code,
        code: `import { queryManager } from "qortex-react";

// Register a fetcher for todos
queryManager.registerFetcher(["todos"], {
  fetcher: async () => {
    const response = await fetch("/api/todos");
    return response.json();
  },
  placeholderData: [] // Show empty array while loading
});`,
    },
    {
        title: 'Use in your React component',
        description: 'Use the useQuery hook to fetch and display data',
        icon: Zap,
        code: `import { useQuery } from "qortex-react";

function TodosList() {
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
]

const features = [
    {
        title: 'Automatic Caching',
        description: 'Data is automatically cached and shared across components',
    },
    {
        title: 'Background Updates',
        description: 'Data is refreshed in the background when it becomes stale',
    },
    {
        title: 'Error Handling',
        description: 'Built-in error handling with retry capabilities',
    },
    {
        title: 'TypeScript Support',
        description: 'Full TypeScript support with type inference',
    },
]

export default function GettingStartedPage() {
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        <span className="gradient-text">Getting Started</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Get started with qortex in minutes. Learn the basics and build your first data fetching application.
                    </p>
                </div>

                {/* Quick Start Steps */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Quick Start</h2>
                    <div className="space-y-8">
                        {steps.map((step, index) => (
                            <div key={step.title} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                                            <step.icon className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <div className="flex items-center">
                                            <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                                            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                                Step {index + 1}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-gray-600">{step.description}</p>
                                        <div className="mt-4">
                                            <pre className="code-block">
                                                <code>{step.code}</code>
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Key Features */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Key Features</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {features.map((feature) => (
                            <div key={feature.title} className="card">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Complete Example */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Complete Example</h2>
                    <div className="card">
                        <p className="text-gray-600 mb-4">
                            Here's a complete example showing how to set up qortex in a React application:
                        </p>
                        <pre className="code-block">
                            <code>{`// App.tsx
import React from 'react';
import { queryManager } from 'qortex-react';
import { TodosList } from './TodosList';

// Set global defaults
queryManager.setDefaultConfig({
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnSubscribe: "stale",
  throttleTime: 100,
  usePreviousDataOnError: true
});

// Register fetchers
queryManager.registerFetcher(["todos"], {
  fetcher: async () => {
    const response = await fetch("/api/todos");
    if (!response.ok) throw new Error('Failed to fetch todos');
    return response.json();
  },
  placeholderData: []
});

queryManager.registerFetcher(["user", "id"], {
  fetcher: async (key) => {
    const [, , userId] = key;
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  }
});

function App() {
  return (
    <div className="app">
      <h1>My Todo App</h1>
      <TodosList />
    </div>
  );
}

export default App;

// TodosList.tsx
import React from 'react';
import { useQuery } from 'qortex-react';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export function TodosList() {
  const { data: todos, isLoading, error, refetch } = useQuery<Todo[]>(["todos"]);

  if (isLoading) return <div>Loading todos...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2>Todos</h2>
        <button 
          onClick={() => refetch()}
          className="btn-primary"
        >
          Refresh
        </button>
      </div>
      <ul className="space-y-2">
        {todos?.map(todo => (
          <li key={todo.id} className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={todo.completed}
              readOnly
            />
            <span className={todo.completed ? 'line-through' : ''}>
              {todo.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}`}</code>
                        </pre>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-primary-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h2>
                    <p className="text-gray-600 mb-4">
                        Now that you have the basics down, explore more advanced features and patterns.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="/docs/basic-usage"
                            className="btn-primary flex items-center justify-center gap-2"
                        >
                            Basic Usage Patterns
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                        <a
                            href="/docs/api"
                            className="btn-secondary"
                        >
                            API Reference
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
