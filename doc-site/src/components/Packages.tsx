import Link from 'next/link'
import { Database, ArrowRight, Sparkles } from 'lucide-react'

export function Packages() {
    return (
        <section className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        <span className="gradient-text">Qortex</span> Ecosystem
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                        Explore our collection of lightweight, powerful packages
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* qortex-db Card */}
                    <div className="relative overflow-visible rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-8 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="absolute -top-3 -right-3 z-10">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg">
                                <Sparkles className="h-3 w-3 mr-1" />
                                NEW
                            </span>
                        </div>

                        <div className="flex items-center mb-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-white">
                                <Database className="h-7 w-7" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-2xl font-bold text-gray-900">qortex-db</h3>
                                <p className="text-sm text-indigo-600 font-medium">Browser Key-Value Database</p>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6">
                            A Redis-like async key-value database for browsers. Unified API across localStorage, sessionStorage, and IndexedDB.
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">localStorage</span>
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">sessionStorage</span>
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">IndexedDB</span>
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">TypeScript</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <code className="text-sm bg-gray-900 text-green-400 px-3 py-2 rounded-lg">
                                npm install qortex-db
                            </code>
                            <Link
                                href="/qortex-db"
                                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                            >
                                Learn more
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* qortex-core/react Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 p-8 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-600 text-white">
                                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-2xl font-bold text-gray-900">qortex-core / react</h3>
                                <p className="text-sm text-purple-600 font-medium">Data Fetching & Caching</p>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6">
                            Minimal, performant data fetching with React integration. Smart caching, deduplication, and built-in persistence.
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">React Hooks</span>
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">Smart Cache</span>
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">Persistence</span>
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">TypeScript</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <code className="text-sm bg-gray-900 text-green-400 px-3 py-2 rounded-lg">
                                npm install qortex-react
                            </code>
                            <Link
                                href="/docs/installation"
                                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                            >
                                Get started
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
