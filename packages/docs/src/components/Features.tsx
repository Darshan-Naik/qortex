import Link from 'next/link'
import {
    Zap,
    Shield,
    Code,
    Cpu,
    RefreshCw,
    Globe,
    Layers,
    ArrowRight,
    Database
} from 'lucide-react'

const features = [
    {
        name: 'Dead Simple',
        description: 'Get started in 30 seconds with an intuitive API that just makes sense.',
        icon: Zap,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
    },
    {
        name: 'Lightning Fast',
        description: 'Minimal bundle size with maximum performance. No bloat, just speed.',
        icon: Cpu,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    {
        name: 'Smart Caching',
        description: 'Automatic deduplication and background updates with intelligent cache management.',
        icon: RefreshCw,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    {
        name: 'Framework Agnostic',
        description: 'Works with React, Vue, Svelte, or vanilla JS. Use anywhere, everywhere.',
        icon: Globe,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
    {
        name: 'TypeScript First',
        description: 'Full type safety out of the box with comprehensive type definitions.',
        icon: Code,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
    },
    {
        name: 'Production Ready',
        description: 'Battle-tested with comprehensive error handling and edge case coverage.',
        icon: Shield,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
    },
    {
        name: 'Previous Data',
        description: 'No loading flickers during refetches. Keep your UI smooth and responsive.',
        icon: Layers,
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
    },
    {
        name: 'Data Persistence',
        description: 'Built-in localStorage and sessionStorage support with configurable debounce timing.',
        icon: Database,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        isNew: true,
    },
]

export function Features() {
    return (
        <section className="bg-gray-50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Why Choose <span className="gradient-text">qortex</span>?
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                        Built with modern development practices in mind, qortex provides everything you need
                        for efficient data fetching without the complexity.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div key={feature.name} className="card group hover:scale-105 transition-transform duration-200 relative">
                            {feature.isNew && (
                                <div className="absolute -top-2 -right-2 z-10">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg animate-pulse">
                                        NEW
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor}`}>
                                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                        {feature.name}
                                    </h3>
                                </div>
                            </div>
                            <p className="mt-4 text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/docs/features" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                        Explore all features
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
