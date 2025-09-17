'use client'

import { useState } from 'react'
import { Copy, Check, Terminal, Package } from 'lucide-react'

const codeExamples = [
    {
        name: 'Installation (React)',
        code: `npm install qortex-react
# or
pnpm add qortex-react
# or
yarn add qortex-react`,
        language: 'bash',
    },
    {
        name: 'Installation (Core)',
        code: `npm install qortex-core
# or
pnpm add qortex-core
# or
yarn add qortex-core`,
        language: 'bash',
    },
    {
        name: 'Basic Usage',
        code: `import { queryManager, useQuery } from "qortex-react";

// Register a fetcher
queryManager.registerFetcher(["todos"], {
  fetcher: async () => {
    const response = await fetch("/api/todos");
    return response.json();
  },
  placeholderData: []
});

// Use in React component
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
        language: 'tsx',
    },
    {
        name: 'Advanced Configuration',
        code: `import { queryManager } from "qortex-core";

// Set global defaults
queryManager.setDefaultConfig({
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnSubscribe: "stale",
  throttleTime: 100,
  usePreviousDataOnError: true
});

// Register fetcher with options
queryManager.registerFetcher(["users"], {
  fetcher: async () => {
    const response = await fetch("/api/users");
    return response.json();
  },
  staleTime: 10 * 60 * 1000, // 10 minutes
  placeholderData: []
});`,
        language: 'tsx',
    },
]

export function QuickStart() {
    const [activeTab, setActiveTab] = useState(0)
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

    const copyToClipboard = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedIndex(index)
            setTimeout(() => setCopiedIndex(null), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    return (
        <section className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Get Started in <span className="gradient-text">30 Seconds</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                        qortex is designed to be simple and intuitive. Here's everything you need to know to get started.
                    </p>
                </div>

                <div className="mt-16">
                    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                        {/* Tab Navigation */}
                        <div className="flex border-b border-gray-700">
                            {codeExamples.map((example, index) => (
                                <button
                                    key={example.name}
                                    onClick={() => setActiveTab(index)}
                                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeTab === index
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                >
                                    {example.language === 'bash' ? (
                                        <Terminal className="h-4 w-4 mr-2" />
                                    ) : (
                                        <Package className="h-4 w-4 mr-2" />
                                    )}
                                    {example.name}
                                </button>
                            ))}
                        </div>

                        {/* Code Content */}
                        <div className="relative">
                            <pre className="code-block p-6 overflow-x-auto">
                                <code>{codeExamples[activeTab].code}</code>
                            </pre>

                            {/* Copy Button */}
                            <button
                                onClick={() => copyToClipboard(codeExamples[activeTab].code, activeTab)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                {copiedIndex === activeTab ? (
                                    <Check className="h-4 w-4 text-green-400" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="bg-primary-50 rounded-lg p-6">
                            <div className="text-2xl font-bold text-primary-600">1</div>
                            <h3 className="mt-2 font-semibold text-gray-900">Install</h3>
                            <p className="mt-1 text-sm text-gray-600">Add qortex to your project</p>
                        </div>
                        <div className="bg-primary-50 rounded-lg p-6">
                            <div className="text-2xl font-bold text-primary-600">2</div>
                            <h3 className="mt-2 font-semibold text-gray-900">Configure</h3>
                            <p className="mt-1 text-sm text-gray-600">Register your fetchers</p>
                        </div>
                        <div className="bg-primary-50 rounded-lg p-6">
                            <div className="text-2xl font-bold text-primary-600">3</div>
                            <h3 className="mt-2 font-semibold text-gray-900">Use</h3>
                            <p className="mt-1 text-sm text-gray-600">Start fetching data in React</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
