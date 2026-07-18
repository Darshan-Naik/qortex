import Link from 'next/link'
import { ArrowLeft, ArrowRight, Zap, Shield, Layers, RefreshCw, Code, Database } from 'lucide-react'
import { ResourceIcon } from '@/components/icons/PackageIcons'
import { Footer } from '@/components/layout'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata = {
    title: 'qortex-resource (alpha) — Entity & form lifecycle',
    description: 'Alpha: fetch → draft → validate → persist → save for data-heavy forms. Framework-agnostic core.',
}

export default function QortexResourcePage() {
    return (
        <>
            <header className="bg-white border-b border-gray-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Home</span>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <ResourceIcon className="h-6 w-6 text-orange-600" />
                            <span className="font-bold text-gray-900">qortex-resource</span>
                            <span className="text-xs font-bold uppercase tracking-wide bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">alpha</span>
                        </div>
                    </div>
                </div>
            </header>

            <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-800 mb-6">
                        <ResourceIcon className="h-4 w-4 mr-2" />
                        Entity / Form Lifecycle · 0.1.0-alpha.0
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                        <span className="text-orange-600">qortex-resource</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl text-gray-600 mb-8">
                        End-to-end draft lifecycle for data-heavy forms: fetch, keep dirty, update, validate, local persist, save, and feedback — without React Context.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-6 mt-8">
                        <code className="bg-gray-900 text-green-400 px-6 py-3 rounded-xl text-lg font-mono shadow-lg">
                            npm install qortex-resource@0.1.0-alpha.0
                        </code>
                        <div className="flex gap-4 flex-wrap justify-center">
                            <Link href="/resource/docs/installation" className="inline-flex items-center px-6 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors shadow-md">
                                Documentation
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            <Link href="/resource-react" className="inline-flex items-center px-6 py-3 rounded-lg bg-white border border-orange-200 text-orange-800 font-semibold hover:bg-orange-50 transition-colors">
                                React bindings
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Start</h2>
                    <CodeBlock language="typescript">{`import { createResource, zodResolver } from 'qortex-resource';
import { z } from 'zod';

const Schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const user = createResource({
  key: ['user', userId],
  validate: { resolver: zodResolver(Schema), on: 'blur' },
  persist: { draft: true },
  source: {
    fetch: () => api.getUser(userId),
    save: (draft) => api.updateUser(userId, draft),
  },
});

user.set('name', 'Ada');
await user.save();`}</CodeBlock>
                </div>
            </section>

            <section className="py-16 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Layers, title: 'Draft overrides', desc: 'Source data + path Map = draft. Fine-grained dirty tracking.', color: 'text-orange-600', bg: 'bg-orange-100' },
                            { icon: Shield, title: 'Validation', desc: 'Field validators or Zod. Modes: change, blur, submit, manual.', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                            { icon: Database, title: 'Local persist', desc: 'Debounced draft survival across refresh with stable keys.', color: 'text-blue-600', bg: 'bg-blue-100' },
                            { icon: Zap, title: 'Optimistic save', desc: 'Flip source early; roll back on failure; keep draft edits.', color: 'text-amber-600', bg: 'bg-amber-100' },
                            { icon: RefreshCw, title: 'Source bridges', desc: 'fetch, query adapter, store adapter, or controlled value.', color: 'text-indigo-600', bg: 'bg-indigo-100' },
                            { icon: Code, title: 'Collections', desc: 'Normalized lists with per-id resources for row editors.', color: 'text-pink-600', bg: 'bg-pink-100' },
                        ].map((f) => (
                            <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.bg} mb-4`}>
                                    <f.icon className={`h-6 w-6 ${f.color}`} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                                <p className="text-gray-600">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-orange-600">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Alpha — APIs may change</h2>
                    <p className="text-orange-100 mb-8">
                        Pin <code className="bg-white/10 px-2 py-1 rounded">0.1.0-alpha.0</code>. Read limitations before production pilots.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link href="/resource/docs/lifecycle" className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-orange-700 font-semibold hover:bg-orange-50">
                            Lifecycle guide
                        </Link>
                        <Link href="/resource/docs/alpha-limitations" className="inline-flex items-center px-6 py-3 rounded-lg border border-white/40 text-white font-semibold hover:bg-white/10">
                            Alpha limitations
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
}
