import { Package, Zap, ExternalLink } from 'lucide-react'

export function BundleSize() {
    return (
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        <span className="gradient-text">Tiny Bundle Sizes</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Both packages are incredibly lightweight and optimized for performance.
                    </p>
                    <p className="font-semibold text-primary-600 text-lg ">Both packages are &lt; 2KB gzipped!</p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* qortex-react bundle info */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 mr-3">
                                    <Package className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">qortex-react</h3>
                                    <p className="text-sm text-gray-600">Complete React solution</p>
                                </div>
                            </div>
                            <a
                                href="https://bundlephobia.com/package/qortex-react"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center">
                            <a
                                href="https://bundlephobia.com/package/qortex-react"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src="https://img.shields.io/bundlephobia/minzip/qortex-react"
                                    alt="qortex-react bundle size"
                                    className="h-6"
                                />
                            </a>
                            <a
                                href="https://bundlephobia.com/package/qortex-react"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src="https://img.shields.io/bundlephobia/min/qortex-react"
                                    alt="qortex-react minified size"
                                    className="h-6"
                                />
                            </a>
                        </div>
                    </div>

                    {/* qortex-core bundle info */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-100 text-secondary-600 mr-3">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">qortex-core</h3>
                                    <p className="text-sm text-gray-600">Framework-agnostic core</p>
                                </div>
                            </div>
                            <a
                                href="https://bundlephobia.com/package/qortex-core"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center">
                            <a
                                href="https://bundlephobia.com/package/qortex-core"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src="https://img.shields.io/bundlephobia/minzip/qortex-core"
                                    alt="qortex-core bundle size"
                                    className="h-6"
                                />
                            </a>
                            <a
                                href="https://bundlephobia.com/package/qortex-core"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src="https://img.shields.io/bundlephobia/min/qortex-core"
                                    alt="qortex-core minified size"
                                    className="h-6"
                                />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center space-y-4">

                    <div className="inline-flex items-center rounded-full glass-effect px-4 py-2 text-sm font-medium text-gray-700">
                        <Zap className="h-4 w-4 mr-2 text-primary-600" />
                        Both packages are tree-shakeable and optimized for minimal bundle impact
                    </div>
                </div>

            </div>
        </section>
    )
}
