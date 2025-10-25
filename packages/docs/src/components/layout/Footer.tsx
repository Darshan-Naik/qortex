import Link from 'next/link'
import { Twitter, BrainCircuit, ExternalLink } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col items-center text-center">
                    {/* Brand */}
                    <Link href="/" className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                            <BrainCircuit className="text-white h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold text-white">Qortex</span>
                    </Link>

                    <p className="text-gray-400 mb-6 max-w-md">
                        A minimal, performant data fetching library with React integration.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 mb-8">
                        <Link
                            href="/docs"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            Documentation
                        </Link>
                        <a
                            href="https://www.npmjs.com/package/qortex-core"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors flex items-center"
                        >
                            <span className="mr-1">📦</span>
                            qortex-core
                            <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                        <a
                            href="https://www.npmjs.com/package/qortex-react"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors flex items-center"
                        >
                            <span className="mr-1">⚛️</span>
                            qortex-react
                            <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                        <a
                            href="https://x.com/Darshan_Naik_"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors flex items-center"
                        >
                            <Twitter className="h-4 w-4 mr-1" />
                            Twitter
                        </a>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © 2025 Darshan Naik. All rights reserved.
                        </p>
                        <p className="text-gray-400 text-sm mt-2 sm:mt-0">
                            <a
                                href="https://darshannaik.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-400 hover:text-primary-300 transition-colors"
                            >
                                darshannaik.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
