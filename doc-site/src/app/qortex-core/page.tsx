import Link from 'next/link'
import { Layers, ArrowLeft, ArrowRight, Zap, RefreshCw, Globe, Code, Shield, Database } from 'lucide-react'
import { Footer } from '@/components/layout'
import { BundleStats } from '@/components/BundleStats'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata = {
    title: 'Qortex Core - Framework Agnostic Query Cache',
    description: 'A minimal, framework-agnostic query cache and fetch registry. Use with React, Vue, Svelte, or vanilla JS.',
}

export default function QortexCorePage() {
    return (
        <>
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Home</span>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Layers className="h-6 w-6 text-purple-600" />
                            <span className="font-bold text-gray-900">qortex-core</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 mb-6">
                        <Globe className="h-4 w-4 mr-2" />
                        Framework Agnostic
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                        <span className="text-purple-600">qortex-core</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl text-gray-600 mb-8">
                        A minimal query cache and fetch registry that works everywhere. Set and read data from React, Vue, Svelte, or vanilla JS.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <code className="bg-gray-900 text-green-400 px-4 py-2 rounded-lg text-lg">
                            npm install qortex-core
                        </code>
                        <Link href="/qortex-core/docs/installation" className="inline-flex items-center px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors">
                            Documentation
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>



            {/* Quick Start */}
            <section className="py-16 bg-white">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Start</h2>
                    <CodeBlock language="typescript">{`import { registerFetcher, fetchQuery, getQueryData } from 'qortex-core';

// Register a fetcher
registerFetcher('users', async () => {
  const res = await fetch('/api/users');
  return res.json();
});

// Fetch data (cached automatically)
const users = await fetchQuery('users');

// Read cached data anywhere
const cachedUsers = getQueryData('users');

// Update cache manually
setQueryData('users', newUsers);

// Invalidate to trigger refetch
invalidateQuery('users');`}</CodeBlock>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: 'Smart Caching', desc: 'Automatic deduplication and intelligent cache management', color: 'text-yellow-600', bg: 'bg-yellow-100' },
                            { icon: Globe, title: 'Framework Agnostic', desc: 'Works in React, Vue, Svelte, or vanilla JavaScript', color: 'text-purple-600', bg: 'bg-purple-100' },
                            { icon: RefreshCw, title: 'Background Updates', desc: 'Stale-while-revalidate pattern built in', color: 'text-blue-600', bg: 'bg-blue-100' },
                            { icon: Code, title: 'TypeScript First', desc: 'Full type inference and safety', color: 'text-indigo-600', bg: 'bg-indigo-100' },
                            { icon: Shield, title: 'Error Handling', desc: 'Comprehensive error states and recovery', color: 'text-green-600', bg: 'bg-green-100' },
                            { icon: Database, title: 'Persistence', desc: 'Optional localStorage/sessionStorage persistence', color: 'text-pink-600', bg: 'bg-pink-100' },
                        ].map((f) => (
                            <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.bg} mb-4`}>
                                    <f.icon className={`h-6 w-6 ${f.color}`} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                                <p className="text-gray-600">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core APIs */}
            <section className="py-16 bg-white">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Core APIs</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-3 px-4 font-semibold text-gray-900">Function</th>
                                    <th className="py-3 px-4 font-semibold text-gray-900">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[
                                    { fn: 'registerFetcher', desc: 'Register a fetch function for a query key' },
                                    { fn: 'fetchQuery', desc: 'Execute a query and cache the result' },
                                    { fn: 'getQueryData', desc: 'Read cached data synchronously' },
                                    { fn: 'setQueryData', desc: 'Update cached data manually' },
                                    { fn: 'getQueryState', desc: 'Get full query state (loading, error, etc.)' },
                                    { fn: 'invalidateQuery', desc: 'Mark query as stale and refetch' },
                                    { fn: 'subscribeQuery', desc: 'Subscribe to query state changes' },
                                ].map((row) => (
                                    <tr key={row.fn}>
                                        <td className="py-3 px-4"><code className="bg-gray-100 px-2 py-1 rounded text-sm text-purple-600">{row.fn}</code></td>
                                        <td className="py-3 px-4 text-gray-600">{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-8 text-center">
                        <Link href="/qortex-core/docs/registerFetcher" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold">
                            View Full Documentation
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>



            {/* Bundle Size */}
            <BundleStats
                packageName="qortex-core"
                size="~2KB"
                minifiedSize="~5KB"
                dependencyCount={0}
                highlightColor="purple"
            />

            {/* CTA */}
            <section className="py-16 bg-purple-600">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to get started?</h2>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <code className="bg-white/10 text-white px-4 py-3 rounded-lg text-lg backdrop-blur">
                            npm install qortex-core
                        </code>
                    </div>
                    <p className="mt-6">
                        <Link href="/qortex-core/docs/installation" className="inline-flex items-center text-purple-200 hover:text-white transition-colors font-semibold">
                            Read the Documentation
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </p>
                </div>
            </section>

            <Footer />
        </>
    )
}
