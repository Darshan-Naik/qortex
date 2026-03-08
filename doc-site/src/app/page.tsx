import Link from 'next/link'
import { Zap, Code, Shield, ArrowRight, BrainCircuit, Layers, RefreshCw, Globe, Github, Database } from 'lucide-react'
import { CoreIcon, ReactIcon, DbIcon, StoreIcon } from '@/components/icons/PackageIcons'
import { NeuralBackground } from '@/components/ui/NeuralBackground'
import { Footer } from '@/components/layout'

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-900 min-h-screen flex items-center">
        <NeuralBackground />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-purple-900/20 to-gray-900/90 pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none z-0"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full bg-white/10 backdrop-blur px-4 py-2 text-sm font-medium text-gray-200 mb-8 border border-white/20">
              <BrainCircuit className="h-4 w-4 mr-2 text-purple-400" />
              Modern Tools for the Web Developers
            </div>

            <h1 className="text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Qortex
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-300 leading-relaxed">
              A suite of lightweight, TypeScript-first packages for data fetching, caching, and storage in the browser.
            </p>

            <div className="mt-10 flex justify-center gap-4 flex-wrap">
              <Link
                href="#packages"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors"
              >
                Explore Packages
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="https://github.com/Darshan-Naik/qortex"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                <Github className="mr-2 h-5 w-5" />
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              The <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Qortex</span> Ecosystem
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the package that fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* qortex-core */}
            <div className="relative bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-600 text-white">
                  <CoreIcon className="h-7 w-7" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">qortex-core</h3>
                  <p className="text-sm text-purple-600 font-medium">Framework Agnostic</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Query cache and fetch registry that works everywhere. Use with React, Vue, Svelte, or vanilla JS.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">Smart Cache</span>
                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">Deduplication</span>
                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">TypeScript</span>
              </div>

              <div className="mt-8 pt-6 border-t border-purple-100/50">
                <code className="block w-full text-center text-sm bg-gray-900 text-green-400 px-4 py-3 rounded-xl mb-4 font-mono shadow-inner">
                  npm i qortex-core
                </code>
                <div className="flex items-center justify-between">
                  <a href="https://www.npmjs.com/package/qortex-core" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-gray-500 hover:text-red-500 transition-colors font-medium text-sm group" title="View on NPM">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current mr-2 group-hover:scale-110 transition-transform"><path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0H1.763zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.048 19.16H5.13V5.323z" /></svg>
                    View on NPM
                  </a>
                  <Link href="/qortex-core" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-bold transition-colors">
                    Documentation <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* qortex-react */}
            <div className="relative bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <ReactIcon className="h-7 w-7" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">qortex-react</h3>
                  <p className="text-sm text-blue-600 font-medium">React Integration</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                React hooks for data fetching with useQuery, useMutate, and more. Includes all core APIs.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">useQuery</span>
                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">useMutate</span>
                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">Suspense</span>
              </div>

              <div className="mt-8 pt-6 border-t border-blue-100/50">
                <code className="block w-full text-center text-sm bg-gray-900 text-green-400 px-4 py-3 rounded-xl mb-4 font-mono shadow-inner">
                  npm i qortex-react
                </code>
                <div className="flex items-center justify-between">
                  <a href="https://www.npmjs.com/package/qortex-react" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-gray-500 hover:text-red-500 transition-colors font-medium text-sm group" title="View on NPM">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current mr-2 group-hover:scale-110 transition-transform"><path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0H1.763zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.048 19.16H5.13V5.323z" /></svg>
                    View on NPM
                  </a>
                  <Link href="/qortex-react" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-bold transition-colors">
                    Documentation <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* qortex-db */}
            <div className="relative bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 overflow-visible">
              <div className="flex items-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <DbIcon className="h-7 w-7" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">qortex-db</h3>
                  <p className="text-sm text-indigo-600 font-medium">Browser Database</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Redis-like key-value store for browsers. Unified API for localStorage, sessionStorage, IndexedDB.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">localStorage</span>
                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">IndexedDB</span>
                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">Async API</span>
              </div>

              <div className="mt-8 pt-6 border-t border-indigo-100/50">
                <code className="block w-full text-center text-sm bg-gray-900 text-green-400 px-4 py-3 rounded-xl mb-4 font-mono shadow-inner">
                  npm i qortex-db
                </code>
                <div className="flex items-center justify-between">
                  <a href="https://www.npmjs.com/package/qortex-db" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-gray-500 hover:text-red-500 transition-colors font-medium text-sm group" title="View on NPM">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current mr-2 group-hover:scale-110 transition-transform"><path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0H1.763zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.048 19.16H5.13V5.323z" /></svg>
                    View on NPM
                  </a>
                  <Link href="/qortex-db" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                    Documentation <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* qortex-store */}
            <div className="relative bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 overflow-visible">
              <div className="absolute -top-3 -right-3 z-10">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg">
                  NEW
                </span>
              </div>

              <div className="flex items-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <StoreIcon className="h-7 w-7" />
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
                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">Zero deps</span>
                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">Actions</span>
                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">Subscribe</span>
              </div>

              <div className="mt-8 pt-6 border-t border-emerald-100/50">
                <code className="block w-full text-center text-sm bg-gray-900 text-green-400 px-4 py-3 rounded-xl mb-4 font-mono shadow-inner">
                  npm i qortex-store
                </code>
                <div className="flex items-center justify-between">
                  <a href="https://www.npmjs.com/package/qortex-store" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-gray-500 hover:text-red-500 transition-colors font-medium text-sm group" title="View on NPM">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current mr-2 group-hover:scale-110 transition-transform"><path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0H1.763zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.048 19.16H5.13V5.323z" /></svg>
                    View on NPM
                  </a>
                  <Link href="/qortex-store" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
                    Documentation <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* qortex-store-react */}
            <div className="relative bg-gradient-to-br from-teal-50 to-emerald-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 overflow-visible">
              <div className="absolute -top-3 -right-3 z-10">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg">
                  NEW
                </span>
              </div>

              <div className="flex items-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-600 text-white">
                  <StoreIcon className="h-7 w-7" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">qortex-store-react</h3>
                  <p className="text-sm text-teal-600 font-medium">React State Hooks</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                React hook for qortex-store with selector support. Concurrent-mode safe with minimal re-renders.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">useStore</span>
                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">Selectors</span>
                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">React 18+</span>
              </div>

              <div className="mt-8 pt-6 border-t border-teal-100/50">
                <code className="block w-full text-center text-sm bg-gray-900 text-green-400 px-4 py-3 rounded-xl mb-4 font-mono shadow-inner">
                  npm i qortex-store-react
                </code>
                <div className="flex items-center justify-between">
                  <a href="https://www.npmjs.com/package/qortex-store-react" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-gray-500 hover:text-red-500 transition-colors font-medium text-sm group" title="View on NPM">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current mr-2 group-hover:scale-110 transition-transform"><path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0H1.763zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.048 19.16H5.13V5.323z" /></svg>
                    View on NPM
                  </a>
                  <Link href="/qortex-store-react" className="inline-flex items-center text-teal-600 hover:text-teal-700 font-bold transition-colors">
                    Documentation <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Qortex */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900">
              Why <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Qortex</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Minimal bundle size (< 3KB), maximum performance.', color: 'text-yellow-600', bg: 'bg-yellow-100' },
              { icon: Code, title: 'TypeScript First', desc: 'Built with TS. Full type safety and inference out of the box.', color: 'text-blue-600', bg: 'bg-blue-100' },
              { icon: Database, title: 'Offline Ready', desc: 'Built-in persistence layers with localStorage & IndexedDB.', color: 'text-teal-600', bg: 'bg-teal-100' },
              { icon: Globe, title: 'Framework Agnostic', desc: 'Core logic works anywhere JavaScript runs.', color: 'text-purple-600', bg: 'bg-purple-100' },
              { icon: RefreshCw, title: 'Smart Caching', desc: 'Auto deduplication, stale-while-revalidate, and cache invalidation.', color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { icon: Shield, title: 'Production Ready', desc: 'Battle-tested reliability with comprehensive error handling.', color: 'text-green-600', bg: 'bg-green-100' },
              { icon: BrainCircuit, title: 'Tiny API', desc: 'Learn in minutes. Simple, intuitive API surface.', color: 'text-pink-600', bg: 'bg-pink-100' },
              { icon: Layers, title: 'Modular Design', desc: 'Tree-shakeable. Import only what you need.', color: 'text-orange-600', bg: 'bg-orange-100' },
            ].map((f) => (
              <div key={f.title} className="text-center group">
                <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${f.bg} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`h-8 w-8 ${f.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      <Footer />
    </>
  )
}