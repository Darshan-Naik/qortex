import { Database, Clock, Key, Code, CheckCircle, AlertTriangle } from 'lucide-react'
import { generateMetadata as generateSEOMetadata, seoConfigs } from '@/lib/seo'

export const metadata = generateSEOMetadata({
    title: 'Data Persistence',
    description: 'Learn how to use Qortex persisters for localStorage and sessionStorage data persistence with configurable debounce timing and burst key cache invalidation.',
    keywords: ['persistence', 'localStorage', 'sessionStorage', 'cache', 'offline', 'data storage']
})

const persistenceFeatures = [
    {
        name: 'localStorage Support',
        description: 'Persist data across browser sessions with localStorage integration.',
        icon: Database,
        details: [
            'Data survives browser restarts',
            'Perfect for user preferences and settings',
            'Automatic serialization and deserialization',
            'Configurable storage key prefix'
        ]
    },
    {
        name: 'sessionStorage Support',
        description: 'Store data for the current session only with sessionStorage.',
        icon: Clock,
        details: [
            'Data cleared when tab is closed',
            'Ideal for temporary application state',
            'Faster than localStorage',
            'Session-scoped data isolation'
        ]
    },
    {
        name: 'Configurable Debounce',
        description: 'Control sync frequency with customizable debounce timing.',
        icon: Clock,
        details: [
            'Default 100ms debounce time',
            'Configurable per persister instance',
            'Optimizes storage write operations',
            'Reduces performance impact'
        ]
    },
    {
        name: 'Burst Key Invalidation',
        description: 'Automatic cache invalidation when application version changes.',
        icon: Key,
        details: [
            'Version-based cache clearing',
            'Prevents stale data issues',
            'Configurable burst key',
            'Automatic data migration'
        ]
    }
]

const codeExamples = [
    {
        title: 'Basic localStorage Persistence',
        description: 'Simple setup with default configuration.',
        code: `import { setDefaultConfig } from 'qortex-core';
import { createPersister } from 'qortex-core/persister';

// Create a localStorage persister
const persister = createPersister('local');

// Configure the query manager
setDefaultConfig({ persister });

// Your queries will now be automatically persisted!`,
        language: 'typescript'
    },
    {
        title: 'Custom Configuration',
        description: 'Advanced configuration with custom settings.',
        code: `import { setDefaultConfig } from 'qortex-core';
import { createPersister } from 'qortex-core/persister';

// Create persister with custom configuration
const persister = createPersister('local', {
  burstKey: 'v1.0.0',        // Version key for cache invalidation
  prefix: 'my_app',          // Storage key prefix
  debounceTime: 50           // Faster sync (50ms instead of 100ms)
});

setDefaultConfig({ persister });`,
        language: 'typescript'
    },
    {
        title: 'Session Storage',
        description: 'Use sessionStorage for temporary data.',
        code: `import { setDefaultConfig } from 'qortex-core';
import { createPersister } from 'qortex-core/persister';

// Session storage for temporary data
const sessionPersister = createPersister('session', {
  prefix: 'temp_data',
  debounceTime: 200  // Slower sync for less frequent updates
});

setDefaultConfig({ persister: sessionPersister });`,
        language: 'typescript'
    },
    {
        title: 'Tree-shakable Imports',
        description: 'Only import what you need to keep bundle size minimal.',
        code: `// Only imports persister functionality when used
import { createPersister } from 'qortex-core/persister';

// If you don't use persisters, they won't be included in your bundle
const persister = createPersister('local');`,
        language: 'typescript'
    },
    {
        title: 'React Package Usage',
        description: 'React users can import from the React package with separate persister entry point.',
        code: `import { setDefaultConfig, useQuery } from 'qortex-react';
import { createPersister } from 'qortex-react/persister';

// Create persister and configure
const persister = createPersister('local');
setDefaultConfig({ persister });

function MyComponent() {
  const { data } = useQuery('users');
  return <div>{data?.name}</div>;
}`,
        language: 'typescript'
    }
]

const bestPractices = [
    {
        title: 'Set Persister Early',
        description: 'Configure the persister before any query usage to avoid data inconsistency.',
        icon: CheckCircle,
        code: `// ✅ Good: Set persister before queries
setDefaultConfig({ persister });
registerFetcher('user', { fetcher: getUserData });

// ❌ Bad: Set persister after queries
registerFetcher('user', { fetcher: getUserData });
setDefaultConfig({ persister }); // Warning will be logged`
    },
    {
        title: 'Use Appropriate Storage',
        description: 'Choose localStorage for persistent data and sessionStorage for temporary data.',
        icon: CheckCircle,
        code: `// ✅ Good: localStorage for user preferences
const userPrefs = createPersister('local', { prefix: 'user_prefs' });

// ✅ Good: sessionStorage for temporary state
const tempState = createPersister('session', { prefix: 'temp' });`
    },
    {
        title: 'Configure Burst Keys',
        description: 'Use meaningful burst keys tied to your application version.',
        icon: CheckCircle,
        code: `// ✅ Good: Version-based burst key
const persister = createPersister('local', {
  burstKey: 'v1.2.3'  // Matches your app version
});

// ✅ Good: Feature-based burst key
const persister = createPersister('local', {
  burstKey: 'user-v2'  // When user data structure changes
});`
    },
    {
        title: 'Optimize Debounce Time',
        description: 'Adjust debounce time based on your application needs.',
        icon: CheckCircle,
        code: `// ✅ Good: Fast sync for real-time apps
const realtimePersister = createPersister('local', {
  debounceTime: 50  // 50ms for quick updates
});

// ✅ Good: Slower sync for battery optimization
const batteryOptimized = createPersister('local', {
  debounceTime: 500  // 500ms for less frequent writes
});`
    }
]

const warnings = [
    {
        title: 'Storage Limitations',
        description: 'Be aware of browser storage limits (typically 5-10MB for localStorage).',
        icon: AlertTriangle
    },
    {
        title: 'Data Validation',
        description: 'Persisted data is automatically validated, but corrupted data will be cleared.',
        icon: AlertTriangle
    },
    {
        title: 'Private Browsing',
        description: 'Some browsers may not support localStorage in private/incognito mode.',
        icon: AlertTriangle
    }
]

export default function PersistencePage() {
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        <span className="gradient-text">Data Persistence</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Persist your query data across browser sessions with built-in localStorage and sessionStorage support.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Persistence Features</h2>
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {persistenceFeatures.map((feature) => (
                            <div key={feature.name} className="card">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                                            <feature.icon className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.name}</h3>
                                        <p className="text-gray-600 mb-4">{feature.description}</p>
                                        <ul className="space-y-2">
                                            {feature.details.map((detail, index) => (
                                                <li key={index} className="flex items-center text-sm text-gray-600">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Code Examples */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Code Examples</h2>
                    <div className="space-y-8">
                        {codeExamples.map((example, index) => (
                            <div key={index} className="card">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{example.title}</h3>
                                <p className="text-gray-600 mb-4">{example.description}</p>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-gray-100">
                                        <code className={example.language}>{example.code}</code>
                                    </pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Best Practices */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Best Practices</h2>
                    <div className="space-y-6">
                        {bestPractices.map((practice, index) => (
                            <div key={index} className="card">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                            <practice.icon className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{practice.title}</h3>
                                        <p className="text-gray-600 mb-4">{practice.description}</p>
                                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                            <pre className="text-sm text-gray-100">
                                                <code className="typescript">{practice.code}</code>
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Warnings */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Important Considerations</h2>
                    <div className="space-y-4">
                        {warnings.map((warning, index) => (
                            <div key={index} className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex-shrink-0">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                                        <warning.icon className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{warning.title}</h3>
                                    <p className="text-gray-600">{warning.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-primary-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready to Add Persistence?</h2>
                    <p className="text-gray-600 mb-4">
                        Start persisting your query data today with just a few lines of code.
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
                            href="/docs/basic-usage"
                            className="btn-secondary"
                        >
                            Basic Usage
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
