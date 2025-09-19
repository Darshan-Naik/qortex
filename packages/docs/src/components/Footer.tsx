import Link from 'next/link'
import { Github, Twitter, ExternalLink, BrainCircuit } from 'lucide-react'

const navigation = {
    product: [
        { name: 'Documentation', href: '/docs' },
        { name: 'API Reference', href: '/docs/api' },
        { name: 'Getting Started', href: '/docs/getting-started' },
        { name: 'Installation', href: '/docs/installation' },
    ],
    community: [
        // { name: 'GitHub', href: 'https://github.com/Darshan-Naik/qortex', external: true },
        // { name: 'Discussions', href: 'https://github.com/Darshan-Naik/qortex/discussions', external: true },
        // { name: 'Issues', href: 'https://github.com/Darshan-Naik/qortex/issues', external: true },
        { name: 'Twitter', href: 'https://x.com/Darshan_Naik_', external: true },
    ],
    resources: [
        { name: 'Basic Usage', href: '/docs/basic-usage' },
        { name: 'Configuration', href: '/docs/configuration' },
        { name: 'Best Practices', href: '/docs/configuration#best-practices' },
        { name: 'TypeScript', href: '/docs/api#typescript-types' },
    ],
}

export function Footer() {
    return (
        <footer className="bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    <BrainCircuit />
                                </span>
                            </div>
                            <span className="text-xl font-bold text-white">Qortex</span>
                        </Link>
                        <p className="mt-4 text-gray-400">
                            A minimal, performant data fetching library with React integration.
                        </p>
                        <div className="mt-6 flex space-x-4">
                            {/* <a
                                href="https://github.com/Darshan-Naik/qortex"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Github className="h-5 w-5" />
                            </a> */}
                            <a
                                href="https://x.com/Darshan_Naik_"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="text-sm font-semibold text-white">Product</h3>
                        <ul className="mt-4 space-y-3">
                            {navigation.product.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h3 className="text-sm font-semibold text-white">Community</h3>
                        <ul className="mt-4 space-y-3">
                            {navigation.community.map((item) => (
                                <li key={item.name}>
                                    <a
                                        href={item.href}
                                        target={item.external ? '_blank' : undefined}
                                        rel={item.external ? 'noopener noreferrer' : undefined}
                                        className="text-gray-400 hover:text-white transition-colors text-sm flex items-center"
                                    >
                                        {item.name}
                                        {item.external && <ExternalLink className="ml-1 h-3 w-3" />}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-sm font-semibold text-white">Resources</h3>
                        <ul className="mt-4 space-y-3">
                            {navigation.resources.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-800 pt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © 2025 Darshan Naik. All rights reserved.
                        </p>
                        <p className="text-gray-400 text-sm mt-4 sm:mt-0">
                            <a
                                href="https://darshannaik.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-400 hover:text-primary-300 transition-colors"
                            >
                                Darshan Naik
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
