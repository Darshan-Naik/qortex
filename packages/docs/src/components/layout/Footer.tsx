import Link from 'next/link'
import { Twitter, BrainCircuit, ExternalLink } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-800">
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
        </footer>
    )
}
