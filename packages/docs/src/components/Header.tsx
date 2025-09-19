'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Github, ExternalLink, Package } from 'lucide-react'

const navigation = [
    { name: 'Docs', href: '/docs' },
    { name: 'Features', href: '/docs/features' },
    { name: 'API Reference', href: '/docs/api' },
    { name: 'Getting Started', href: '/docs/getting-started' },
]

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [packageMenuOpen, setPackageMenuOpen] = useState(false)
    const pathname = usePathname()
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
                                <span className="text-white font-bold text-lg">Q</span>
                            </div>
                            <span className="text-xl font-bold gradient-text">Qortex</span>
                        </Link>
                    </div>

                    <div className="ml-10 hidden space-x-8 lg:block">
                        {navigation.map((item) => {
                            const isActive = item.href === '/docs'
                                ? pathname === '/docs'
                                : pathname === item.href || pathname.startsWith(item.href)
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`font-medium transition-colors duration-200 ${isActive
                                        ? 'text-primary-600 border-b-2 border-primary-600 pb-1'
                                        : 'text-gray-700 hover:text-primary-600'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            )
                        })}
                    </div>

                    <div className="ml-6 flex items-center space-x-4">
                        {/* <Link
                            href="https://github.com/Darshan-Naik/qortex"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
                        >
                            <Github className="h-5 w-5" />
                        </Link> */}

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

                        <button
                            type="button"
                            className="lg:hidden text-gray-700 hover:text-primary-600"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
                            {navigation.map((item) => {
                                const isActive = item.href === '/docs'
                                    ? pathname === '/docs'
                                    : pathname === item.href || pathname.startsWith(item.href)
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`block px-3 py-2 font-medium transition-colors duration-200 ${isActive
                                            ? 'text-primary-600 bg-primary-50 rounded-md'
                                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md'
                                            }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
}
