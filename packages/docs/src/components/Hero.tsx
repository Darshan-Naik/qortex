import Link from 'next/link'
import { ArrowRight, Zap, Shield, Code } from 'lucide-react'

export function Hero() {
    return (
        <section className="relative overflow-hidden gradient-bg min-h-screen flex items-center">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                <div className="text-center">
                    <div className="inline-flex items-center rounded-full glass-effect px-4 py-2 text-sm font-medium text-gray-700 mb-8 animate-float">
                        <Zap className="h-4 w-4 mr-2 text-primary-600" />
                        Lightning Fast • Minimal Bundle • TypeScript First
                    </div>

                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl lg:text-8xl mb-6">
                        <span className="gradient-text">qortex</span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600 leading-relaxed">
                        A minimal, performant data fetching library with React integration.
                        Built for <strong>simplicity</strong>, <strong>efficiency</strong>, and
                        <strong> developer happiness</strong>! 🎉
                    </p>

                    <div className="mt-10 flex items-center justify-center">
                        <Link href="/docs" className="btn-primary text-lg px-8 py-4 flex items-center justify-center w-fit">
                            Get Started
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>

                    <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
                        <div className="flex flex-col items-center text-center card animate-fade-in">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 mb-4">
                                <Zap className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Lightning Fast</h3>
                            <p className="mt-2 text-gray-600">Minimal bundle size with maximum performance</p>
                        </div>

                        <div className="flex flex-col items-center text-center card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-100 text-secondary-600 mb-4">
                                <Shield className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Production Ready</h3>
                            <p className="mt-2 text-gray-600">Battle-tested with comprehensive error handling</p>
                        </div>

                        <div className="flex flex-col items-center text-center card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-100 text-accent-600 mb-4">
                                <Code className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">TypeScript First</h3>
                            <p className="mt-2 text-gray-600">Full type safety out of the box</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background decoration with subtle blur effects */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-40 left-1/2 w-80 h-80 bg-accent-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
            </div>
        </section>
    )
}
