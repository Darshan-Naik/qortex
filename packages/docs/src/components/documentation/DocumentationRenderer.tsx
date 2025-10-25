'use client';

import { DocumentationData, ApiDocumentation, GuideDocumentation } from '@/types/documentation';
import { isApiDocumentation, isGuideDocumentation } from '@/lib/documentation';
import {
    Badge,
    Callout,
    BehaviorList,
    BestPractices,
    ParametersTable,
    ExamplesList,
    Signature,
    Returns,
    RelatedPages
} from './index';
import { BrainCircuit } from 'lucide-react';

interface DocumentationRendererProps {
    data: DocumentationData;
}

export function DocumentationRenderer({ data }: DocumentationRendererProps) {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center mr-4">
                        <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-3">
                            <h2 className="text-2xl font-bold text-gray-900">{data.title}</h2>
                            {isApiDocumentation(data) && data.status && (
                                <Badge
                                    text={data.status}
                                    variant={
                                        data.status === 'stable' ? 'success' :
                                            data.status === 'beta' ? 'warning' :
                                                'error'
                                    }
                                />
                            )}
                        </div>
                        <p className="text-gray-600 text-sm">{data.subtitle}</p>
                    </div>
                </div>
                <p className="text-gray-700 text-sm">{data.description}</p>
                {data.badges && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {data.badges.map((badge, index) => (
                            <Badge key={index} text={badge.text} variant={badge.variant} />
                        ))}
                    </div>
                )}
            </div>

            {/* Callouts */}
            {data.callouts && data.callouts.length > 0 && (
                <div className="my-6 space-y-4">
                    {data.callouts.map((callout, index) => (
                        <Callout
                            key={index}
                            type={callout.type as any}
                            title={callout.title}
                            content={callout.content}
                            icon={callout.icon as any}
                        />
                    ))}
                </div>
            )}

            {/* Content */}
            {isGuideDocumentation(data) && data.content && (
                <div className="mb-10">
                    <p className="text-gray-700 leading-relaxed">{data.content}</p>
                </div>
            )}

            {/* API Documentation Specific */}
            {isApiDocumentation(data) && (
                <>
                    {/* Signature */}
                    {data.signature && (
                        <div className="mb-10">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Signature</h2>
                            <Signature language={data.signature.language} code={data.signature.code} />
                        </div>
                    )}

                    {/* Parameters */}
                    {data.parameters && (
                        <div className="mb-10">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Parameters</h2>
                            <ParametersTable columns={data.parameters.columns} rows={data.parameters.rows} />
                        </div>
                    )}

                    {/* Returns */}
                    {data.returns && (
                        <div className="mb-10">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Returns</h2>
                            <Returns
                                type={data.returns.type}
                                description={data.returns.description}
                                properties={data.returns.properties}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Examples */}
            {isApiDocumentation(data) && data.examples && data.examples.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Examples</h2>
                    <ExamplesList examples={data.examples} />
                </div>
            )}

            {/* Behavior */}
            {isApiDocumentation(data) && data.behavior && data.behavior.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Behavior</h2>
                    <BehaviorList behaviors={data.behavior} />
                </div>
            )}

            {/* Best Practices */}
            {isApiDocumentation(data) && data.bestPractices && (
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Best Practices</h2>
                    <BestPractices dos={data.bestPractices.dos} donts={data.bestPractices.donts} />
                </div>
            )}

            {/* Sections (for guides) */}
            {isGuideDocumentation(data) && data.sections && data.sections.length > 0 && (
                <div className="mb-10 space-y-8">
                    {data.sections.map((section, index) => (
                        <div key={index}>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{section.title}</h2>
                            {section.content && (
                                <p className="text-gray-700 leading-relaxed mb-6">{section.content}</p>
                            )}
                            {section.code && (
                                <ExamplesList examples={[{
                                    title: section.title,
                                    language: section.code.language,
                                    code: section.code.code
                                }]} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Related Pages */}
            {data.relatedPages && data.relatedPages.length > 0 && (
                <div className="mb-10">
                    <RelatedPages pages={data.relatedPages} />
                </div>
            )}
        </div>
    );
}
