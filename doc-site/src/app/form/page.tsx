import Link from 'next/link'
import { ArrowLeft, ArrowRight, Zap, Shield, Code, Layers, FileEdit, Database } from 'lucide-react'
import { ResourceIcon } from '@/components/icons/PackageIcons'
import { Footer } from '@/components/layout'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata = {
    title: 'Qortex Form - Headless Form Engine',
    description: 'Source → draft → validate → persist → save(mutator). Framework-agnostic form core.',
}

export default function QortexFormPage() {
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
                            <span className="font-bold text-gray-900">qortex-form</span>
                            <span className="text-xs font-bold uppercase tracking-wide text-orange-600">Alpha</span>
                        </div>
                    </div>
                </div>
            </header>

            <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700 mb-6">
                        <ResourceIcon className="h-4 w-4 mr-2" />
                        Headless Form Engine · 0.1.0-alpha.0
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                        <span className="text-orange-600">qortex-form</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl text-gray-600 mb-8">
                        Source data → draft edits → validate → persist → save(mutator) → resetDraft.
                        Compose with qortex-query for loading — form never fetches.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-6 mt-8">
                        <code className="bg-gray-900 text-green-400 px-6 py-3 rounded-xl text-lg font-mono shadow-lg">
                            npm i qortex-form@0.1.0-alpha.0
                        </code>
                        <div className="flex gap-4">
                            <Link href="/form/docs/installation" className="inline-flex items-center px-6 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg">
                                Documentation
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            <Link href="/form-react" className="inline-flex items-center px-6 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                                React bindings
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Start</h2>
                    <CodeBlock language="typescript">{`import { createForm } from "qortex-form";

const user = createForm({
  key: ["user", id],
  data: serverUser,
  validate: {
    fields: { name: (v) => (!v ? "Required" : null) },
  },
});

user.set("name", "Ada");
await user.save(async (draft) => api.updateUser(id, draft));
// On success: draft resets. Mutator result is NOT applied as data.
user.destroy();`}</CodeBlock>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: FileEdit, title: 'Draft overrides', desc: 'Path-level edits until save or reset', color: 'text-orange-600', bg: 'bg-orange-100' },
                            { icon: Shield, title: 'Validation', desc: 'Field validators + zodResolver', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                            { icon: Database, title: 'Persist', desc: 'Optional draft/cache via localStorage or custom storage', color: 'text-blue-600', bg: 'bg-blue-100' },
                            { icon: Code, title: 'Framework-agnostic', desc: 'Works anywhere JS runs', color: 'text-purple-600', bg: 'bg-purple-100' },
                            { icon: Layers, title: 'Arrays & nested paths', desc: 'Stable array ids and dot-path controllers', color: 'text-indigo-600', bg: 'bg-indigo-100' },
                            { icon: Zap, title: 'Compose query', desc: 'Pair with qortex-query — form does not reimplement cache', color: 'text-yellow-600', bg: 'bg-yellow-100' },
                        ].map((f) => (
                            <div key={f.title} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
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
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to get started?</h2>
                    <code className="bg-white/10 text-white px-4 py-3 rounded-lg text-lg backdrop-blur">
                        npm i qortex-form@0.1.0-alpha.0
                    </code>
                    <p className="mt-6 text-orange-200">
                        <Link href="/form/docs/installation" className="inline-flex items-center hover:text-white transition-colors">
                            Read the docs
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </p>
                </div>
            </section>

            <Footer />
        </>
    )
}
