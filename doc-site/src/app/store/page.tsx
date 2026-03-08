import Link from 'next/link'
import { ArrowLeft, ArrowRight, Zap, Shield, Code, Layers, RefreshCw, Clock } from 'lucide-react'
import { StoreIcon } from '@/components/icons/PackageIcons'
import { Footer } from '@/components/layout'
import { BundleStats } from '@/components/BundleStats'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata = {
    title: 'Qortex Store - Lightweight State Management',
    description: 'A tiny, type-safe, framework-agnostic state management library. Zero dependencies.',
}

export default function QortexStorePage() {
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
                            <StoreIcon className="h-6 w-6 text-emerald-600" />
                            <span className="font-bold text-gray-900">qortex-store</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 mb-6">
                        <StoreIcon className="h-4 w-4 mr-2" />
                        State Management
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                        <span className="text-emerald-600">qortex-store</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl text-gray-600 mb-8">
                        A tiny, type-safe state management library. Framework-agnostic core that works anywhere — Node, browser, vanilla JS. Zero dependencies.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-6 mt-8">
                        <code className="bg-gray-900 text-green-400 px-6 py-3 rounded-xl text-lg font-mono shadow-lg">
                            npm install qortex-store
                        </code>
                        <div className="flex gap-4">
                            <Link href="/store/docs/installation" className="inline-flex items-center px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg">
                                Documentation
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            <a href="https://www.npmjs.com/package/qortex-store" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm" title="View on NPM">
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
                    <CodeBlock language="typescript">{`import { createStore } from 'qortex-store';

// Create a store with state and actions
const counterStore = createStore((set, get) => ({
  count: 0,
  increment: () => set({ count: get().count + 1 }),
  decrement: () => set((s) => ({ count: s.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// Read state
counterStore.get().count; // 0

// Update state
counterStore.get().increment();
counterStore.get().count; // 1

// Subscribe to changes
const unsub = counterStore.subscribe((state, prev) => {
  console.log(prev.count, '→', state.count);
});`}</CodeBlock>
                </div>
            </section>



            {/* Features */}
            <section className="py-16 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: 'Tiny Bundle', desc: 'Zero runtime dependencies, minimal overhead', color: 'text-yellow-600', bg: 'bg-yellow-100' },
                            { icon: Shield, title: 'Type-Safe', desc: 'Full TypeScript generics and inference', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                            { icon: Code, title: 'Framework-Agnostic', desc: 'Works anywhere — Node, browser, vanilla JS', color: 'text-blue-600', bg: 'bg-blue-100' },
                            { icon: Layers, title: 'Shallow Merge', desc: 'set shallow-merges by default, or replace entirely', color: 'text-purple-600', bg: 'bg-purple-100' },
                            { icon: RefreshCw, title: 'Subscribe / Unsubscribe', desc: 'Listen for state changes with cleanup', color: 'text-pink-600', bg: 'bg-pink-100' },
                            { icon: Clock, title: 'Actions Pattern', desc: 'Define actions alongside state in the initializer', color: 'text-indigo-600', bg: 'bg-indigo-100' },
                        ].map((f) => (
                            <div key={f.title} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
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
            <section className="py-16 bg-gray-50">
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
                                    { method: 'createStore(init)', desc: 'Create a new store with initial state and actions' },
                                    { method: 'get()', desc: 'Read the current state snapshot' },
                                    { method: 'set(partial, replace?)', desc: 'Update state (merge or replace)' },
                                    { method: 'subscribe(listener)', desc: 'Listen for changes, returns unsubscribe fn' },
                                    { method: 'destroy()', desc: 'Clear listeners and reset to initial state' },
                                ].map((row) => (
                                    <tr key={row.method}>
                                        <td className="py-3 px-4"><code className="bg-gray-100 px-2 py-1 rounded text-sm text-emerald-600">{row.method}</code></td>
                                        <td className="py-3 px-4 text-gray-600">{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Bundle Size */}
            <BundleStats
                packageName="qortex-store"
                size="~0.5KB"
                minifiedSize="1.2KB"
                dependencyCount={0}
                highlightColor="emerald"
            />

            {/* CTA */}
            <section className="py-16 bg-emerald-600">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to get started?</h2>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <code className="bg-white/10 text-white px-4 py-3 rounded-lg text-lg backdrop-blur">
                            npm install qortex-store
                        </code>
                    </div>
                    <p className="mt-6 text-emerald-200">
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
