import { Zap, Shield, Code, Cpu, RefreshCw, Globe, Layers, CheckCircle } from 'lucide-react'
import { generateMetadata as generateSEOMetadata, seoConfigs } from '@/lib/seo'

export const metadata = generateSEOMetadata(seoConfigs.features)

const features = [
  {
    name: 'Dead Simple',
    description: 'Get started in 30 seconds with an intuitive API that just makes sense.',
    icon: Zap,
    details: [
      'Minimal API surface area',
      'Zero configuration required',
      'Intuitive naming conventions',
      'Clear documentation and examples'
    ]
  },
  {
    name: 'Lightning Fast',
    description: 'Optimized for performance with intelligent caching and minimal re-renders.',
    icon: Cpu,
    details: [
      'Intelligent request deduplication',
      'Background refetching',
      'Optimistic updates',
      'Minimal bundle size (< 2KB)'
    ]
  },
  {
    name: 'TypeScript First',
    description: 'Built with TypeScript from the ground up for complete type safety.',
    icon: Code,
    details: [
      'Full type inference',
      'Generic type support',
      'Compile-time error checking',
      'Excellent IDE support'
    ]
  },
  {
    name: 'Production Ready',
    description: 'Battle-tested with comprehensive error handling and edge case coverage.',
    icon: Shield,
    details: [
      'Robust error handling',
      'Automatic retry logic',
      'Network failure recovery',
      'Memory leak prevention'
    ]
  },
  {
    name: 'Smart Caching',
    description: 'Intelligent caching system that reduces API calls and improves performance.',
    icon: RefreshCw,
    details: [
      'Configurable stale times',
      'Background updates',
      'Cache invalidation',
      'Memory-efficient storage'
    ]
  },
  {
    name: 'React Integration',
    description: 'Seamless integration with React hooks and component lifecycle.',
    icon: Globe,
    details: [
      'useQuery hook',
      'useQueryData hook',
      'useQuerySelect with smart subscription',
      'Automatic cleanup',
      'SSR support'
    ]
  },
  {
    name: 'Smart Subscription',
    description: 'Automatic optimization that only re-renders when accessed properties change.',
    icon: Cpu,
    details: [
      'Automatic property detection',
      'Minimal re-renders',
      'Performance optimization',
      'Zero configuration required'
    ]
  },
  {
    name: 'Flexible Configuration',
    description: 'Highly configurable to fit your specific needs and use cases.',
    icon: Layers,
    details: [
      'Global configuration',
      'Per-query customization',
      'Custom equality functions',
      'Placeholder data support'
    ]
  }
]


export default function FeaturesPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            <span className="gradient-text">Features</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Explore all the powerful features that make Qortex the perfect choice for your data fetching needs.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Core Features</h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.name} className="card">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                      <feature.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.name}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Why Choose Qortex */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Why Choose Qortex?</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="card text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 mx-auto mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Minimal Bundle</h3>
              <p className="text-gray-600">Less than 2KB gzipped, making it one of the smallest data fetching libraries available.</p>
            </div>
            <div className="card text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 mx-auto mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Zero Configuration</h3>
              <p className="text-gray-600">Works out of the box with sensible defaults. No complex setup required.</p>
            </div>
            <div className="card text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 mx-auto mb-4">
                <Code className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Developer Experience</h3>
              <p className="text-gray-600">Built with developer happiness in mind. Intuitive API and excellent TypeScript support.</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-primary-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-4">
            Experience the power of Qortex for yourself. Get started in minutes with our simple installation guide.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/docs/installation"
              className="btn-primary"
            >
              Installation Guide
            </a>
            <a
              href="/docs/getting-started"
              className="btn-secondary"
            >
              Getting Started
            </a>
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
  )
}
