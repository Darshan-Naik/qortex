import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { CoreIcon, ReactIcon, DbIcon, StoreIcon } from './icons/PackageIcons'

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

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* qortex-db Card */}
                    <div className="relative overflow-visible rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-8 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg overflow-hidden">
                                <DbIcon className="h-8 w-8 text-white" />
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
                                Documentation
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* qortex-store Card */}
                    <div className="relative overflow-visible rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 p-8 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="absolute -top-3 -right-3 z-10">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg">
                                <Sparkles className="h-3 w-3 mr-1" />
                                NEW
                            </span>
                        </div>

                        <div className="flex items-center mb-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg overflow-hidden">
                                <StoreIcon className="h-8 w-8 text-white" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-2xl font-bold text-gray-900">qortex-store</h3>
                                <p className="text-sm text-emerald-600 font-medium">State Management</p>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6">
                            Tiny, type-safe state management. Framework-agnostic core that works anywhere — zero dependencies.
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">Zero deps</span>
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">Actions</span>
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">Subscribe</span>
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">TypeScript</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <code className="text-sm bg-gray-900 text-green-400 px-3 py-2 rounded-lg">
                                npm install qortex-store
                            </code>
                            <Link
                                href="/qortex-store"
                                className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                            >
                                Documentation
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* qortex-core/react Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 p-8 shadow-lg hover:shadow-xl transition-shadow">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <CoreIcon className="h-32 w-32 text-purple-600" />
                        </div>

                        <div className="flex items-center mb-4 relative">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg overflow-hidden">
                                <ReactIcon className="h-8 w-8 text-white" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-2xl font-bold text-gray-900">qortex-core / react</h3>
                                <p className="text-sm text-purple-600 font-medium">Data Fetching & Caching</p>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6 relative">
                            Minimal, performant data fetching with React integration. Smart caching, deduplication, and built-in persistence.
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6 relative">
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">React Hooks</span>
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">Smart Cache</span>
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">Persistence</span>
                            <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">TypeScript</span>
                        </div>

                        <div className="flex items-center justify-between relative">
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
