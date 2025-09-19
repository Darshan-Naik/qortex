import { Metadata } from 'next'
import { BookOpen, Code, Zap, Shield, Lightbulb } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Guides',
    description: 'Comprehensive guides for using qortex effectively. Learn advanced patterns, best practices, and real-world examples.',
}

const guides = [
    {
        title: 'Getting Started',
        description: 'Learn the basics of qortex and set up your first data fetching solution',
        icon: BookOpen,
        href: '/docs/getting-started',
        difficulty: 'Beginner',
        duration: '5 min read'
    },
    {
        title: 'Basic Usage',
        description: 'Master the fundamental patterns for data fetching with qortex',
        icon: Code,
        href: '/docs/basic-usage',
        difficulty: 'Beginner',
        duration: '10 min read'
    },
    {
        title: 'Configuration',
        description: 'Configure qortex for your specific needs and optimize performance',
        icon: Zap,
        href: '/docs/configuration',
        difficulty: 'Intermediate',
        duration: '15 min read'
    },
    {
        title: 'Error Handling',
        description: 'Implement robust error handling and recovery strategies',
        icon: Shield,
        href: '/docs/error-handling',
        difficulty: 'Intermediate',
        duration: '12 min read'
    },
    {
        title: 'Performance Tips',
        description: 'Optimize your qortex usage for maximum performance',
        icon: Zap,
        href: '/docs/performance',
        difficulty: 'Advanced',
        duration: '20 min read'
    },
    {
        title: 'TypeScript Support',
        description: 'Use qortex with TypeScript for type-safe data fetching',
        icon: Code,
        href: '/docs/typescript',
        difficulty: 'Intermediate',
        duration: '15 min read'
    },
    {
        title: 'API Reference',
        description: 'Complete reference for all qortex functions and options',
        icon: BookOpen,
        href: '/docs/api',
        difficulty: 'Reference',
        duration: '30 min read'
    }
]

const learningPaths = [
    {
        title: 'Beginner Path',
        description: 'Start here if you\'re new to qortex',
        icon: BookOpen,
        guides: [
            { name: 'Getting Started', href: '/docs/getting-started' },
            { name: 'Basic Usage', href: '/docs/basic-usage' },
            { name: 'Installation', href: '/docs/installation' }
        ]
    },
    {
        title: 'Intermediate Path',
        description: 'Build on the basics with advanced features',
        icon: Code,
        guides: [
            { name: 'Configuration', href: '/docs/configuration' },
            { name: 'Error Handling', href: '/docs/error-handling' },
            { name: 'TypeScript Support', href: '/docs/typescript' }
        ]
    },
    {
        title: 'Advanced Path',
        description: 'Master qortex for production applications',
        icon: Zap,
        guides: [
            { name: 'Performance Tips', href: '/docs/performance' },
            { name: 'API Reference', href: '/docs/api' }
        ]
    }
]


export default function GuidesPage() {
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        <span className="gradient-text">Guides</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Comprehensive guides for using qortex effectively. Learn advanced patterns, best practices, and real-world examples.
                    </p>
                </div>

                {/* Learning Paths */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Learning Paths</h2>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {learningPaths.map((path) => (
                            <div key={path.title} className="card">
                                <div className="flex items-center mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 mr-3">
                                        <path.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{path.title}</h3>
                                        <p className="text-sm text-gray-600">{path.description}</p>
                                    </div>
                                </div>
                                <ul className="space-y-2">
                                    {path.guides.map((guide) => (
                                        <li key={guide.name}>
                                            <a
                                                href={guide.href}
                                                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                            >
                                                {guide.name} →
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* All Guides */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">All Guides</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {guides.map((guide) => (
                            <a
                                key={guide.title}
                                href={guide.href}
                                className="card hover:shadow-lg transition-all duration-200 group"
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 group-hover:bg-primary-200 transition-colors">
                                            <guide.icon className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                {guide.title}
                                            </h3>
                                            <span className="text-xs text-gray-500">{guide.duration}</span>
                                        </div>
                                        <p className="text-gray-600 mb-3">{guide.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${guide.difficulty === 'Beginner'
                                                ? 'bg-green-100 text-green-800'
                                                : guide.difficulty === 'Intermediate'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : guide.difficulty === 'Advanced'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {guide.difficulty}
                                            </span>
                                            <span className="text-primary-600 text-sm font-medium group-hover:text-primary-700">
                                                Read guide →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>


                {/* Getting Help */}
                <div className="bg-primary-50 rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <Lightbulb className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="ml-4">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Need Help?</h2>
                            <p className="text-gray-600 mb-4">
                                Can't find what you're looking for? Check out our community resources or get in touch.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {/* <a
                                    href="https://github.com/Darshan-Naik/qortex/discussions"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary"
                                >
                                    GitHub Discussions
                                </a>
                                <a
                                    href="https://github.com/Darshan-Naik/qortex/issues"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary"
                                >
                                    Report Issue
                                </a> */}
                                <span className="text-gray-500 text-sm">Repository is currently private</span>
                                <a
                                    href="/docs/api"
                                    className="btn-secondary"
                                >
                                    API Reference
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
