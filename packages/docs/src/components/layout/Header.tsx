'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ExternalLink, Package, BrainCircuit } from 'lucide-react'
import { StarButton } from '../StarButton'

// No navigation items needed - only Home and Docs pages

export function Header() {
    const [packageMenuOpen, setPackageMenuOpen] = useState(false)
    const packageMenuRef = useRef<HTMLDivElement>(null)

    // Close package menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (packageMenuRef.current && !packageMenuRef.current.contains(event.target as Node)) {
                setPackageMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <header className="glass-effect border-b border-gray-200 sticky top-0 z-50">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex w-full items-center justify-between py-4">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    <BrainCircuit />
                                </span>
                            </div>
                            <span className="text-xl font-bold gradient-text">Qortex</span>
                        </Link>
                    </div>

                    {/* Navigation removed - only Home and Docs pages */}

                    <div className="ml-6 flex items-center space-x-4">
                        <StarButton size="sm" showCount={true} showMessage={false} />

                        {/* Package dropdown */}
                        <div className="relative" ref={packageMenuRef}>
                            <button
                                onClick={() => setPackageMenuOpen(!packageMenuOpen)}
                                className="text-gray-700 hover:text-primary-600 transition-colors duration-200 flex items-center"
                            >
                                <Package className="h-5 w-5" />
                            </button>

                            {packageMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <Link
                                        href="https://www.npmjs.com/package/qortex-react"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                                        onClick={() => setPackageMenuOpen(false)}
                                    >
                                        <div className="flex items-center">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            qortex-react
                                        </div>
                                    </Link>
                                    <Link
                                        href="https://www.npmjs.com/package/qortex-core"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                                        onClick={() => setPackageMenuOpen(false)}
                                    >
                                        <div className="flex items-center">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            qortex-core
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button removed - no navigation items */}
                    </div>
                </div>

                {/* Mobile menu removed - no navigation items */}
            </nav>
        </header>
    )
}
