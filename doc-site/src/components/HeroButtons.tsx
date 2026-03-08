'use client'

import Link from 'next/link'
import { ArrowRight, Github, ExternalLink, Package } from 'lucide-react'

export function HeroButtons() {
    return (
        <div className="mt-10">
            <div className="flex items-center justify-center gap-6">
                <Link href="/docs/installation" className="btn-primary text-lg px-8 py-4 flex items-center justify-center w-fit h-14">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <a
                    href="https://github.com/Darshan-Naik/qortex"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 text-lg rounded-lg font-medium transition-all duration-200 bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 active:scale-95 shadow-lg"
                >
                    <Github className="h-5 w-5" />
                    <span>GitHub</span>
                    <ExternalLink className="h-4 w-4" />
                </a>
            </div>

            {/* NPM Package Links */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                    href="https://www.npmjs.com/package/@qortex/query"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-gray-200"
                >
                    <Package className="h-5 w-5 text-primary-600" />
                    <span className="font-semibold">@qortex/query</span>
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                </a>
                <a
                    href="https://www.npmjs.com/package/@qortex/query-react"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-gray-200"
                >
                    <Package className="h-5 w-5 text-primary-600" />
                    <span className="font-semibold">@qortex/query-react</span>
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                </a>
            </div>
        </div>
    )
}
