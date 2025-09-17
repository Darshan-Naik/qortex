import { Package, Zap } from 'lucide-react'

export function BundleSize() {
    return (
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        <span className="gradient-text">Tiny Bundle Sizes</span>
                    </h2>
                    <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                        See the actual bundle sizes of qortex packages. Both packages are incredibly lightweight and optimized for performance.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* qortex-react bundle widget */}
                    <div className="card">
                        <div className="flex items-center mb-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 mr-4">
                                <Package className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">qortex-react</h3>
                                <p className="text-gray-600">Complete React solution</p>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-4 mb-4">
                            <iframe
                                src="https://deno.bundlejs.com/?q=qortex-react&badge=detailed&badge-style=for-the-badge"
                                className="w-full h-20 border-0 rounded"
                                title="qortex-react bundle size"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Live bundle analysis</span>
                            <a
                                href="https://bundlejs.com/?q=qortex-react"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                                View on BundleJS →
                            </a>
                        </div>
                    </div>

                    {/* qortex-core bundle widget */}
                    <div className="card">
                        <div className="flex items-center mb-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100 text-secondary-600 mr-4">
                                <Zap className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">qortex-core</h3>
                                <p className="text-gray-600">Framework-agnostic core</p>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-4 mb-4">
                            <iframe
                                src="https://deno.bundlejs.com/?q=qortex-core&badge=detailed&badge-style=for-the-badge"
                                className="w-full h-20 border-0 rounded"
                                title="qortex-core bundle size"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Live bundle analysis</span>
                            <a
                                href="https://bundlejs.com/?q=qortex-core"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                                View on BundleJS →
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <div className="inline-flex items-center rounded-full glass-effect px-6 py-3 text-sm font-medium text-gray-700">
                        <Zap className="h-4 w-4 mr-2 text-primary-600" />
                        Both packages are tree-shakeable and optimized for minimal bundle impact
                    </div>
                </div>
            </div>
        </section>
    )
}
