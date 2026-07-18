import Link from 'next/link'
import { ArrowLeft, ArrowRight, Zap, Shield, Layers, Link2, KeyRound, ListTree } from 'lucide-react'
import { ResourceIcon } from '@/components/icons/PackageIcons'
import { Footer } from '@/components/layout'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata = {
    title: 'qortex-resource-react (alpha) — React hooks',
    description: 'Alpha React bindings: useResource, useField, useFieldArray, createResourceHooks — no Context.',
}

export default function QortexResourceReactPage() {
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
                            <span className="font-bold text-gray-900">qortex-resource-react</span>
                            <span className="text-xs font-bold uppercase tracking-wide bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">alpha</span>
                        </div>
                    </div>
                </div>
            </header>

            <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-800 mb-6">
                        React Hooks · 0.1.0-alpha.0
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                        <span className="text-orange-600">qortex-resource-react</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl text-gray-600 mb-8">
                        Fine-grained field subscriptions for large forms. Pass a Resource or bind module hooks — no React Context.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-6 mt-8">
                        <code className="bg-gray-900 text-green-400 px-6 py-3 rounded-xl text-sm sm:text-lg font-mono shadow-lg">
                            npm i qortex-resource-react@0.1.0-alpha.0
                        </code>
                        <div className="flex gap-4 flex-wrap justify-center">
                            <Link href="/resource-react/docs/installation" className="inline-flex items-center px-6 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors shadow-md">
                                Documentation
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            <Link href="/resource" className="inline-flex items-center px-6 py-3 rounded-lg bg-white border border-orange-200 text-orange-800 font-semibold hover:bg-orange-50 transition-colors">
                                Core package
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Start</h2>
                    <CodeBlock language="tsx">{`import { useResource, useField } from 'qortex-resource-react';

function ProfileForm() {
  const { resource, isChanged, save } = useResource({
    initialData: { name: '' },
    source: { save: (d) => api.save(d) },
  });

  return (
    <>
      <NameField resource={resource} />
      <button disabled={!isChanged} onClick={() => save()}>Save</button>
    </>
  );
}

function NameField({ resource }) {
  const { value, onChange, onBlur, error } = useField(resource, 'name');
  return (
    <>
      <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
      {error}
    </>
  );
}`}</CodeBlock>
                </div>
            </section>

            <section className="py-16 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: 'useField', desc: 'Leaf re-renders only — built for big nested forms.', color: 'text-orange-600', bg: 'bg-orange-100' },
                            { icon: ListTree, title: 'useFieldArray', desc: 'Stable row ids across reorder/move.', color: 'text-amber-600', bg: 'bg-amber-100' },
                            { icon: Link2, title: 'No Context', desc: 'Pass resource or createResourceHooks module singleton.', color: 'text-blue-600', bg: 'bg-blue-100' },
                            { icon: KeyRound, title: 'Dynamic identity', desc: 'Factory hooks: useResource(productId) recreates on key.', color: 'text-indigo-600', bg: 'bg-indigo-100' },
                            { icon: Layers, title: 'useCollection', desc: 'Normalized lists with getResource(id) per row.', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                            { icon: Shield, title: 'Typed paths', desc: 'PathOf / PathValue when using the core typings.', color: 'text-pink-600', bg: 'bg-pink-100' },
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
                    <h2 className="text-3xl font-bold text-white mb-6">Start with the guides</h2>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link href="/resource-react/docs/sharing-patterns" className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-orange-700 font-semibold hover:bg-orange-50">
                            Sharing patterns
                        </Link>
                        <Link href="/resource-react/docs/dynamic-identity" className="inline-flex items-center px-6 py-3 rounded-lg border border-white/40 text-white font-semibold hover:bg-white/10">
                            Dynamic identity
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
}
