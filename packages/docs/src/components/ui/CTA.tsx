import Link from 'next/link'
import { ArrowRight, Github } from 'lucide-react'

export function CTA() {
    return (
        <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Ready to get started?
                    </h2>

                    <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
                        <Link
                            href="/docs"
                            className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center"
                        >
                            Get Started
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        {/* <Link
                            href="https://github.com/Darshan-Naik/qortex"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 border border-primary-500 flex items-center"
                        >
                            <Github className="mr-2 h-5 w-5" />
                            View on GitHub
                        </Link> */}
                    </div>

                </div>
            </div>
        </section>
    )
}
