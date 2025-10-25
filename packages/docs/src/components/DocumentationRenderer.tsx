'use client';

import { DocumentationData, ApiDocumentation, GuideDocumentation } from '@/types/documentation';
import { CodeBlock } from '@/components/CodeBlock';
import {
    BrainCircuit,
    CheckCircle,
    XCircle,
    Info,
    AlertTriangle,
    Zap,
    Database,
    RefreshCw,
    Activity,
    AlertCircle,
    Trash2,
    ExternalLink
} from 'lucide-react';
import { isApiDocumentation, isGuideDocumentation } from '@/lib/documentation';

interface DocumentationRendererProps {
    data: DocumentationData;
}

const iconMap = {
    'info': Info,
    'warning': AlertTriangle,
    'error': XCircle,
    'success': CheckCircle,
    'zap': Zap,
    'database': Database,
    'refresh-cw': RefreshCw,
    'activity': Activity,
    'alert-triangle': AlertTriangle,
    'trash-2': Trash2,
    'external-link': ExternalLink,
    'brain-circuit': BrainCircuit
};

const badgeVariants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
};

const calloutVariants = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
};

const statusVariants = {
    stable: 'bg-green-100 text-green-800',
    beta: 'bg-yellow-100 text-yellow-800',
    deprecated: 'bg-red-100 text-red-800'
};

function Badge({ text, variant }: { text: string; variant: keyof typeof badgeVariants }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeVariants[variant]}`}>
            {text}
        </span>
    );
}

function Callout({ type, title, content, icon }: {
    type: keyof typeof calloutVariants;
    title?: string;
    content: string;
    icon?: string;
}) {
    const IconComponent = icon ? iconMap[icon as keyof typeof iconMap] || Info : Info;

    return (
        <div className={`rounded-lg border p-4 mb-6 ${calloutVariants[type]}`}>
            <div className="flex items-start">
                <IconComponent className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                    {title && <h4 className="font-semibold mb-2">{title}</h4>}
                    <p className="text-sm leading-relaxed">{content}</p>
                </div>
            </div>
        </div>
    );
}

function ParametersTable({ parameters }: { parameters: ApiDocumentation['parameters'] }) {
    if (!parameters) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-gray-600 mr-2">📋</span>
                Parameters
            </h3>
            <div className="space-y-6">
                {parameters.rows.map((row, index) => (
                    <div key={index} className="border-l-4 border-primary-200 pl-4 py-2">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                <h4 className="text-base font-semibold text-gray-900">{row.name}</h4>
                                <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                                    {row.type}
                                </code>
                                {row.required ? (
                                    <Badge text="Required" variant="error" />
                                ) : (
                                    <Badge text="Optional" variant="default" />
                                )}
                            </div>
                        </div>

                        <p className="text-gray-700 text-sm leading-relaxed mb-2">
                            {row.description}
                        </p>

                        {row.default !== '-' && (
                            <div className="text-xs text-gray-500">
                                <span className="font-medium">Default:</span>{' '}
                                <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded font-mono">
                                    {row.default}
                                </code>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReturnsSection({ returns }: { returns: ApiDocumentation['returns'] }) {
    if (!returns) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-gray-600 mr-2">↩️</span>
                Returns
            </h3>

            <div className="border-l-4 border-secondary-200 pl-4 py-2">
                <div className="flex items-center space-x-3 mb-3">
                    <h4 className="text-base font-semibold text-gray-900">Return Value</h4>
                    <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                        {returns.type}
                    </code>
                </div>

                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {returns.description}
                </p>

                {returns.properties && returns.properties.length > 0 && (
                    <div className="mt-4">
                        <h5 className="text-sm font-semibold text-gray-900 mb-3">Properties:</h5>
                        <div className="space-y-4">
                            {returns.properties.map((prop, index) => (
                                <div key={index} className="border-l-2 border-gray-200 pl-3 py-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h6 className="text-sm font-medium text-gray-900">{prop.name}</h6>
                                        <code className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-mono">
                                            {prop.type}
                                        </code>
                                    </div>
                                    <p className="text-gray-600 text-xs leading-relaxed">
                                        {prop.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ExamplesSection({ examples }: { examples: ApiDocumentation['examples'] }) {
    if (!examples || examples.length === 0) return null;

    return (
        <div className="space-y-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-gray-600 mr-3">💡</span>
                Examples
            </h3>
            {examples.map((example, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{example.title}</h4>
                    {example.description && (
                        <p className="text-gray-600 mb-4">{example.description}</p>
                    )}
                    <CodeBlock language={example.language}>
                        {example.code}
                    </CodeBlock>
                </div>
            ))}
        </div>
    );
}

function BehaviorSection({ behavior }: { behavior: ApiDocumentation['behavior'] }) {
    if (!behavior || behavior.length === 0) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-gray-600 mr-2">⚡</span>
                Behavior
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {behavior.map((item, index) => {
                    const IconComponent = iconMap[item.icon as keyof typeof iconMap] || BrainCircuit;
                    return (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                                <IconComponent className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function BestPracticesSection({ bestPractices }: { bestPractices: ApiDocumentation['bestPractices'] }) {
    if (!bestPractices) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Best Practices
                </h3>
                <ul className="space-y-2">
                    {bestPractices.dos.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-green-800">
                            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                    <XCircle className="h-5 w-5 mr-2" />
                    Avoid
                </h3>
                <ul className="space-y-2">
                    {bestPractices.donts.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-red-800">
                            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function ApiDocumentationRenderer({ data }: { data: ApiDocumentation }) {
    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                        <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-3">
                            <h2 className="text-2xl font-bold text-gray-900">{data.title}</h2>
                            {data.status && (
                                <Badge text={data.status} variant={data.status === 'stable' ? 'success' : data.status === 'beta' ? 'warning' : 'error'} />
                            )}
                        </div>
                        <p className="text-gray-600">{data.subtitle}</p>
                    </div>
                </div>
                <p className="text-gray-700">{data.description}</p>
                {data.badges && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {data.badges.map((badge, index) => (
                            <Badge key={index} text={badge.text} variant={badge.variant} />
                        ))}
                    </div>
                )}
            </div>

            {/* Callouts */}
            {data.callouts && data.callouts.map((callout, index) => (
                <Callout key={index} {...callout} />
            ))}

            {/* Signature Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="text-gray-600 mr-2">📝</span>
                    Function Signature
                </h3>
                <CodeBlock language={data.signature.language}>
                    {data.signature.code}
                </CodeBlock>
            </div>

            {/* Parameters */}
            <ParametersTable parameters={data.parameters} />

            {/* Returns */}
            <ReturnsSection returns={data.returns} />

            {/* Examples */}
            <ExamplesSection examples={data.examples} />

            {/* Behavior */}
            <BehaviorSection behavior={data.behavior} />

            {/* Best Practices */}
            <BestPracticesSection bestPractices={data.bestPractices} />
        </div>
    );
}

function GuideDocumentationRenderer({ data }: { data: GuideDocumentation }) {
    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                        <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{data.title}</h2>
                        {data.subtitle && <p className="text-gray-600">{data.subtitle}</p>}
                    </div>
                </div>
                {data.description && <p className="text-gray-700">{data.description}</p>}
                {data.badges && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {data.badges.map((badge, index) => (
                            <Badge key={index} text={badge.text} variant={badge.variant} />
                        ))}
                    </div>
                )}
            </div>

            {/* Callouts */}
            {data.callouts && data.callouts.map((callout, index) => (
                <Callout key={index} {...callout} />
            ))}

            {/* Content */}
            <div className="prose prose-lg prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">{data.content}</p>
            </div>

            {/* Sections */}
            {data.sections && data.sections.map((section, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{section.title}</h3>
                    <p className="text-gray-700 mb-4">{section.content}</p>
                    {section.code && (
                        <CodeBlock language={section.code.language}>
                            {section.code.code}
                        </CodeBlock>
                    )}
                </div>
            ))}
        </div>
    );
}

export function DocumentationRenderer({ data }: DocumentationRendererProps) {
    if (isApiDocumentation(data)) {
        return <ApiDocumentationRenderer data={data} />;
    } else if (isGuideDocumentation(data)) {
        return <GuideDocumentationRenderer data={data} />;
    }

    return (
        <div className="text-center py-12">
            <p className="text-gray-500">Unable to render documentation</p>
        </div>
    );
}
