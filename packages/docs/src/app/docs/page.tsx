import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Book, Code, Zap, Shield, Star } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Documentation',
    description: 'Complete documentation for qortex - the minimal, performant data fetching library with React integration.',
}

const docSections = [
    {
        title: 'Getting Started',
        description: 'Learn the basics and get up and running with qortex in minutes.',
        icon: Zap,
        href: '/docs/getting-started',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
    },
    {
        title: 'Features',
        description: 'Explore all the powerful features that make qortex the perfect choice.',
        icon: Star,
        href: '/docs/features',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
    {
        title: 'API Reference',
        description: 'Complete API documentation for all qortex functions and hooks.',
        icon: Code,
        href: '/docs/api',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    {
        title: 'Guides',
        description: 'In-depth guides covering common patterns and best practices.',
        icon: Book,
        href: '/docs/guides',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
]


export default function DocsPage() {
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        <span className="gradient-text">Documentation</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                        Everything you need to know to build amazing applications with qortex.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {docSections.map((section) => (
                        <Link
                            key={section.title}
                            href={section.href}
                            className="card group hover:scale-105 transition-transform duration-200"
                        >
                            <div className="flex items-center">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${section.bgColor}`}>
                                    <section.icon className={`h-6 w-6 ${section.color}`} />
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                        {section.title}
                                    </h3>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                            </div>
                            <p className="mt-4 text-gray-600 leading-relaxed">
                                {section.description}
                            </p>
                        </Link>
                    ))}
                </div>

            </div>
        </div>
    )
}
