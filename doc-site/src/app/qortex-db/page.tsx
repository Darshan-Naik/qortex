import Link from 'next/link'
import { ArrowLeft, ArrowRight, Zap, Shield, Code, HardDrive, Clock, FileSearch, Database } from 'lucide-react'
import { DbIcon } from '@/components/icons/PackageIcons'
import { Footer } from '@/components/layout'
import { BundleStats } from '@/components/BundleStats'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata = {
    title: 'Qortex DB - Browser Key-Value Database',
    description: 'A Redis-like async key-value database for browsers with localStorage, sessionStorage, and IndexedDB support.',
}

export default function QortexDBPage() {
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
                            <DbIcon className="h-6 w-6 text-indigo-600" />
                            <span className="font-bold text-gray-900">qortex-db</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 mb-6">
                        <DbIcon className="h-4 w-4 mr-2" />
                        Browser Key-Value Database
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                        <span className="text-indigo-600">qortex-db</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl text-gray-600 mb-8">
                        A Redis-like async key-value database for browsers. Unified API across localStorage, sessionStorage, and IndexedDB.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-6 mt-8">
                        <code className="bg-gray-900 text-green-400 px-6 py-3 rounded-xl text-lg font-mono shadow-lg">
                            npm install qortex-db
                        </code>
                        <div className="flex gap-4">
                            <Link href="/qortex-db/docs/installation" className="inline-flex items-center px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg">
                                Documentation
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            <a href="https://www.npmjs.com/package/qortex-db" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm" title="View on NPM">
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
                    <CodeBlock language="typescript">{`import { createDB } from 'qortex-db';

// Simple usage (uses localStorage by default)
const db = createDB('myapp');

// Or with options
const db = createDB({ name: 'myapp', driver: 'indexedDB' });

// Store data
await db.set('user:1', { name: 'John', age: 30 });

// Retrieve data
const user = await db.get<User>('user:1');

// Check existence
const exists = await db.has('user:1');

// Delete
await db.del('user:1');

// Find keys by pattern
const userKeys = await db.scan('user:*');

// Clear all data
await db.drop();`}</CodeBlock>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: 'Unified API', desc: 'Same async interface for all storage backends', color: 'text-yellow-600', bg: 'bg-yellow-100' },
                            { icon: HardDrive, title: 'Multiple Drivers', desc: 'localStorage, sessionStorage, and IndexedDB', color: 'text-blue-600', bg: 'bg-blue-100' },
                            { icon: Code, title: 'TypeScript First', desc: 'Full type inference and safety', color: 'text-indigo-600', bg: 'bg-indigo-100' },
                            { icon: Shield, title: 'Key Namespacing', desc: 'Data isolation between database instances', color: 'text-green-600', bg: 'bg-green-100' },
                            { icon: FileSearch, title: 'Pattern Matching', desc: 'Find keys with wildcard patterns', color: 'text-purple-600', bg: 'bg-purple-100' },
                            { icon: Clock, title: 'Tiny Bundle', desc: 'Under 3KB minified and gzipped', color: 'text-pink-600', bg: 'bg-pink-100' },
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

            {/* API Reference */}
            <section className="py-16 bg-white">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">API Reference</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-3 px-4 font-semibold text-gray-900">Method</th>
                                    <th className="py-3 px-4 font-semibold text-gray-900">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[
                                    { method: 'get<T>(key)', desc: 'Retrieve a value by key' },
                                    { method: 'set(key, value)', desc: 'Store a value (JSON serialized)' },
                                    { method: 'has(key)', desc: 'Check if a key exists' },
                                    { method: 'del(key)', desc: 'Delete a key-value pair' },
                                    { method: 'scan(pattern)', desc: 'Find keys matching pattern (* wildcard)' },
                                    { method: 'drop()', desc: 'Delete all data for this database' },
                                ].map((row) => (
                                    <tr key={row.method}>
                                        <td className="py-3 px-4"><code className="bg-gray-100 px-2 py-1 rounded text-sm text-indigo-600">{row.method}</code></td>
                                        <td className="py-3 px-4 text-gray-600">{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Drivers */}
            <section className="py-16 bg-gray-50">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Storage Drivers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { driver: 'local', name: 'localStorage', persistence: 'Permanent', capacity: '~5MB', desc: 'Default, most common use case' },
                            { driver: 'session', name: 'sessionStorage', persistence: 'Tab session', capacity: '~5MB', desc: 'Cleared when tab closes' },
                            { driver: 'indexedDB', name: 'IndexedDB', persistence: 'Permanent', capacity: 'Large', desc: 'For large datasets' },
                        ].map((d) => (
                            <div key={d.driver} className="bg-white rounded-xl p-6 shadow-sm">
                                <code className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm mb-3">{d.driver}</code>
                                <h3 className="font-semibold text-gray-900 mb-2">{d.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{d.desc}</p>
                                <div className="text-xs text-gray-500">
                                    <span className="block">Persistence: {d.persistence}</span>
                                    <span className="block">Capacity: {d.capacity}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Bundle Size */}
            <BundleStats
                packageName="qortex-db"
                size="~1.2KB"
                minifiedSize="2.7KB"
                dependencyCount={0}
                highlightColor="indigo"
            />

            {/* CTA */}
            <section className="py-16 bg-indigo-600">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to get started?</h2>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <code className="bg-white/10 text-white px-4 py-3 rounded-lg text-lg backdrop-blur">
                            npm install qortex-db
                        </code>
                    </div>
                    <p className="mt-6 text-indigo-200">
                        <Link href="/" className="inline-flex items-center hover:text-white transition-colors">
                            Back to Home
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </p>
                </div>
            </section>

            <Footer />
        </>
    )
}
