import Link from 'next/link'
import { ArrowLeft, ArrowRight, Zap, Code, Shield, Database, Layers, Clock, RefreshCw } from 'lucide-react'
import { ReactIcon } from '@/components/icons/PackageIcons'
import { Footer } from '@/components/layout'
import { BundleStats } from '@/components/BundleStats'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata = {
    title: 'Qortex React - React Hooks for Data Fetching',
    description: 'React hooks for data fetching with useQuery, useMutate, and more. Includes all core APIs.',
}

export default function QortexReactPage() {
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
                            <ReactIcon className="h-6 w-6 text-blue-600" />
                            <span className="font-bold text-gray-900">qortex-react</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 mb-6">
                        <ReactIcon className="h-4 w-4 mr-2" />
                        React Integration
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                        <span className="text-blue-600">qortex-react</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl text-gray-600 mb-8">
                        React hooks for data fetching with smart caching, background updates, and full TypeScript support.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-6 mt-8">
                        <code className="bg-gray-900 text-green-400 px-6 py-3 rounded-xl text-lg font-mono shadow-lg">
                            npm install qortex-react
                        </code>
                        <div className="flex gap-4">
                            <Link href="/qortex-react/docs/installation" className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                                Documentation
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            <a href="https://www.npmjs.com/package/qortex-react" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm" title="View on NPM">
                                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0H1.763zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.048 19.16H5.13V5.323z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Start */}
            <section className="py-16 bg-white">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Start</h2>
                    <CodeBlock language="typescript">{`import { useQuery, useMutate, registerFetcher } from 'qortex-react';

// Register a fetcher
registerFetcher('users', async () => {
  const res = await fetch('/api/users');
  return res.json();
});

// Use in your component
function UserList() {
  const { data, isLoading, error } = useQuery('users');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}`}</CodeBlock>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: 'Auto Caching', desc: 'Automatic request deduplication and caching', color: 'text-yellow-600', bg: 'bg-yellow-100' },
                            { icon: RefreshCw, title: 'Background Updates', desc: 'Stale-while-revalidate with previousData', color: 'text-blue-600', bg: 'bg-blue-100' },
                            { icon: Clock, title: 'No Loading Flickers', desc: 'Keep showing old data during refetch', color: 'text-purple-600', bg: 'bg-purple-100' },
                            { icon: Code, title: 'TypeScript First', desc: 'Full type inference for your data', color: 'text-indigo-600', bg: 'bg-indigo-100' },
                            { icon: Shield, title: 'Error Handling', desc: 'Declarative error states with retry', color: 'text-green-600', bg: 'bg-green-100' },
                            { icon: Database, title: 'Persistence', desc: 'Optional localStorage/sessionStorage sync', color: 'text-pink-600', bg: 'bg-pink-100' },
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

            {/* React Hooks */}
            <section className="py-16 bg-white">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">React Hooks</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-3 px-4 font-semibold text-gray-900">Hook</th>
                                    <th className="py-3 px-4 font-semibold text-gray-900">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[
                                    { hook: 'useQuery', desc: 'Fetch and cache data with loading/error states' },
                                    { hook: 'useMutate', desc: 'Perform mutations with optimistic updates' },
                                    { hook: 'useQueryData', desc: 'Subscribe to cached data reactively' },
                                    { hook: 'useQuerySelect', desc: 'Select and transform cached data' },
                                ].map((row) => (
                                    <tr key={row.hook}>
                                        <td className="py-3 px-4"><code className="bg-gray-100 px-2 py-1 rounded text-sm text-blue-600">{row.hook}</code></td>
                                        <td className="py-3 px-4 text-gray-600">{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-8 text-center">
                        <Link href="/qortex-react/docs/useQuery" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold">
                            View Full Documentation
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Includes Core */}
            <section className="py-16 bg-blue-50">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Includes All Core APIs</h2>
                    <p className="text-gray-600 mb-6">
                        qortex-react re-exports everything from qortex-core, so you get all the core functionality too.
                    </p>
                    <code className="inline-block bg-gray-900 text-gray-300 px-4 py-3 rounded-lg text-sm">
                        {`import { useQuery, registerFetcher, fetchQuery, getQueryData } from 'qortex-react';`}
                    </code>
                </div>
            </section>



            {/* Bundle Size */}
            <BundleStats
                packageName="qortex-react"
                size="~2.6KB"
                minifiedSize="~6.5KB"
                dependencyCount={1}
                highlightColor="blue"
                sizeBreakdown="~0.7KB (React) + ~1.9KB (Core)"
            />

            {/* CTA */}
            <section className="py-16 bg-blue-600">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to get started?</h2>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <code className="bg-white/10 text-white px-4 py-3 rounded-lg text-lg backdrop-blur">
                            npm install qortex-react
                        </code>
                    </div>
                    <p className="mt-6">
                        <Link href="/qortex-react/docs/installation" className="inline-flex items-center text-blue-200 hover:text-white transition-colors font-semibold">
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
