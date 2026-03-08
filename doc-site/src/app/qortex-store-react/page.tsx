import Link from 'next/link'
import { ArrowLeft, ArrowRight, Zap, Shield, Layers, RefreshCw, Code, Clock } from 'lucide-react'
import { StoreIcon } from '@/components/icons/PackageIcons'
import { Footer } from '@/components/layout'
import { BundleStats } from '@/components/BundleStats'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata = {
    title: 'Qortex Store React - React Bindings for qortex-store',
    description: 'React hook for qortex-store with selector support and concurrent-mode safety.',
}

export default function QortexStoreReactPage() {
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
                            <StoreIcon className="h-6 w-6 text-teal-600" />
                            <span className="font-bold text-gray-900">qortex-store-react</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center rounded-full bg-teal-100 px-4 py-2 text-sm font-medium text-teal-700 mb-6">
                        <StoreIcon className="h-4 w-4 mr-2" />
                        React State Hooks
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                        <span className="text-teal-600">qortex-store-react</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl text-gray-600 mb-8">
                        React hook for qortex-store with selector support. Concurrent-mode safe and optimized for minimal re-renders.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-6 mt-8">
                        <code className="bg-gray-900 text-green-400 px-6 py-3 rounded-xl text-lg font-mono shadow-lg">
                            npm install qortex-store-react
                        </code>
                        <div className="flex gap-4">
                            <Link href="/qortex-store-react/docs/installation" className="inline-flex items-center px-6 py-3 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg">
                                Documentation
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            <a href="https://www.npmjs.com/package/qortex-store-react" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm" title="View on NPM">
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
                    <CodeBlock language="tsx">{`import { createStore, useStore } from 'qortex-store-react';

// Create a store (in a separate file)
const counterStore = createStore((set, get) => ({
  count: 0,
  increment: () => set({ count: get().count + 1 }),
}));

// Use in React components
function Counter() {
  const count = useStore(counterStore, (s) => s.count);
  const increment = useStore(counterStore, (s) => s.increment);

  return <button onClick={increment}>Count: {count}</button>;
}`}</CodeBlock>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Layers, title: 'Selector Support', desc: 'Pick only the state slices you need', color: 'text-teal-600', bg: 'bg-teal-100' },
                            { icon: RefreshCw, title: 'Concurrent Safe', desc: 'Fully compatible with React 18+ concurrent features', color: 'text-blue-600', bg: 'bg-blue-100' },
                            { icon: Zap, title: 'Minimal Re-renders', desc: 'Re-renders only when selected values change', color: 'text-yellow-600', bg: 'bg-yellow-100' },
                            { icon: Shield, title: 'Custom Equality', desc: 'Bring your own equality function for object selectors', color: 'text-green-600', bg: 'bg-green-100' },
                            { icon: Code, title: 'TypeScript First', desc: 'Full generic type inference out of the box', color: 'text-purple-600', bg: 'bg-purple-100' },
                            { icon: Clock, title: 'Auto Cleanup', desc: 'Unsubscribes automatically on unmount', color: 'text-pink-600', bg: 'bg-pink-100' },
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
                                    <th className="py-3 px-4 font-semibold text-gray-900">Parameter</th>
                                    <th className="py-3 px-4 font-semibold text-gray-900">Type</th>
                                    <th className="py-3 px-4 font-semibold text-gray-900">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[
                                    { param: 'store', type: 'Store<T>', desc: 'A store created with createStore' },
                                    { param: 'selector?', type: '(state: T) => U', desc: 'Picks a state slice (defaults to identity)' },
                                    { param: 'equalityFn?', type: '(a: U, b: U) => boolean', desc: 'Custom equality (defaults to Object.is)' },
                                ].map((row) => (
                                    <tr key={row.param}>
                                        <td className="py-3 px-4"><code className="bg-gray-100 px-2 py-1 rounded text-sm text-teal-600">{row.param}</code></td>
                                        <td className="py-3 px-4"><code className="text-sm text-gray-700">{row.type}</code></td>
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
                packageName="qortex-store-react"
                size="~0.3KB"
                minifiedSize="0.8KB"
                dependencyCount={1}
                highlightColor="teal"
            />

            {/* CTA */}
            <section className="py-16 bg-teal-600">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to get started?</h2>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <code className="bg-white/10 text-white px-4 py-3 rounded-lg text-lg backdrop-blur">
                            npm install qortex-store-react
                        </code>
                    </div>
                    <p className="mt-6 text-teal-200">
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
