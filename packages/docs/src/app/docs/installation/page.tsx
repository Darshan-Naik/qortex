import { Metadata } from 'next'
import { Package, Terminal, Code, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Installation',
    description: 'Learn how to install and set up qortex in your project. Get started with npm, pnpm, or yarn.',
}

const installationOptions = [
    {
        title: 'For React Applications (React 18+)',
        description: 'Use qortex-react for complete React integration with hooks',
        icon: Package,
        code: `# Using npm
npm install qortex-react

# Using pnpm
pnpm add qortex-react

# Using yarn
yarn add qortex-react`,
        note: 'Includes qortex-core automatically',
    },
    {
        title: 'For React Applications (React 16.8-17)',
        description: 'Use qortex-react-legacy for React versions below 18',
        icon: Package,
        code: `# Using npm
npm install qortex-react-legacy

# Using pnpm
pnpm add qortex-react-legacy

# Using yarn
yarn add qortex-react-legacy`,
        note: 'Uses useEffect/useState instead of useSyncExternalStore',
    },
    {
        title: 'For Other Frameworks',
        description: 'Use qortex-core for framework-agnostic data fetching',
        icon: Terminal,
        code: `# Using npm
npm install qortex-core

# Using pnpm
pnpm add qortex-core

# Using yarn
yarn add qortex-core`,
        note: 'Use with Vue, Svelte, or vanilla JavaScript',
    },
]

const installationSteps = [
    {
        title: 'Choose Your Package',
        description: 'Select the package that fits your framework',
        icon: Package,
        code: `// For React 18+ applications
import { useQuery, registerFetcher, setDefaultConfig } from "qortex-react";

// For React 16.8-17 applications
import { useQuery, registerFetcher, setDefaultConfig } from "qortex-react-legacy";

// For other frameworks
import { registerFetcher, setDefaultConfig } from "qortex-core";`,
    },
    {
        title: 'Import and Setup',
        description: 'Import qortex in your application',
        icon: Code,
        code: `// For React 18+
import { useQuery, registerFetcher, setDefaultConfig } from "qortex-react";

// For React 16.8-17
import { useQuery, registerFetcher, setDefaultConfig } from "qortex-react-legacy";

// Set global defaults (optional)
setDefaultConfig({
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnSubscribe: "stale",
  throttleTime: 100,
  usePreviousDataOnError: false
});`,
    },
    {
        title: 'Register Fetchers',
        description: 'Register your data fetching functions',
        icon: Terminal,
        code: `// Register a fetcher
registerFetcher(["todos"], {
  fetcher: async () => {
    const response = await fetch("/api/todos");
    return response.json();
  },
  placeholderData: []
});`,
    },
    {
        title: 'Use in Components',
        description: 'Start using qortex in your React components',
        icon: CheckCircle,
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
]

const requirements = [
    'React 18 or higher (React 16.8+ supported with legacy package)',
    'TypeScript 5.0 or higher (recommended)',
    'Node.js 16 or higher',
]

const packageInfo = [
    {
        name: 'qortex-react',
        description: 'Complete React data fetching solution for React 18+ (includes qortex-core)',
        size: '< 2KB gzipped',
        features: ['useQuery hook', 'useQueryData hook', 'useQuerySelect hook', 'Query management', 'Caching', 'Deduplication', 'Background updates', 'React 18+ integration'],
        useCase: 'React 18+ applications',
    },
    {
        name: 'qortex-react-legacy',
        description: 'React data fetching solution for React 16.8-17 (includes qortex-core)',
        size: '< 2KB gzipped',
        features: ['useQuery hook', 'useQueryData hook', 'useQuerySelect hook', 'Query management', 'Caching', 'Deduplication', 'Background updates', 'Legacy React support'],
        useCase: 'React 16.8-17 applications',
    },
    {
        name: 'qortex-core',
        description: 'Framework-agnostic data fetching library',
        size: '< 2KB gzipped',
        features: ['Query management', 'Caching', 'Deduplication', 'Background updates', 'TypeScript support', 'Framework agnostic'],
        useCase: 'Vue, Svelte, vanilla JS',
    },
]

export default function InstallationPage() {
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        <span className="gradient-text">Installation</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Get started with qortex in your project. Installation is simple and takes just a few minutes.
                    </p>
                </div>

                {/* Requirements */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                        <ul className="space-y-2">
                            {requirements.map((requirement) => (
                                <li key={requirement} className="flex items-center text-gray-700">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                    {requirement}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Installation Options */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Choose Your Package</h2>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {installationOptions.map((option) => (
                            <div key={option.title} className="card">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                                            <option.icon className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{option.title}</h3>
                                        <p className="mt-2 text-gray-600">{option.description}</p>
                                        <div className="mt-4">
                                            <pre className="code-block">
                                                <code>{option.code}</code>
                                            </pre>
                                        </div>
                                        <p className="mt-3 text-sm text-primary-600 font-medium">{option.note}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Installation Steps */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Setup Steps</h2>
                    <div className="space-y-8">
                        {installationSteps.map((step, index) => (
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

                {/* Package Information */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Package Information</h2>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {packageInfo.map((pkg) => (
                            <div key={pkg.name} className="card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                                    <span className="text-sm text-gray-500">{pkg.size}</span>
                                </div>
                                <p className="text-gray-600 mb-2">{pkg.description}</p>
                                <p className="text-sm text-primary-600 font-medium mb-4">Best for: {pkg.useCase}</p>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                                    <ul className="space-y-1">
                                        {pkg.features.map((feature) => (
                                            <li key={feature} className="text-sm text-gray-600 flex items-center">
                                                <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-primary-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h2>
                    <p className="text-gray-600 mb-4">
                        Now that you have qortex installed, you're ready to start building amazing applications!
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="/docs/basic-usage"
                            className="btn-primary"
                        >
                            Basic Usage Guide
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
