import { CodeBlock } from '@/components/ui';

interface Example {
    title: string;
    description?: string;
    language: string;
    code: string;
}

interface ExamplesListProps {
    examples: Example[];
}

export function ExamplesList({ examples }: ExamplesListProps) {
    return (
        <div className="space-y-6">
            {examples.map((example, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-900">{example.title}</h4>
                        {example.description && (
                            <p className="text-sm text-gray-600 mt-1">{example.description}</p>
                        )}
                    </div>
                    <div className="p-0">
                        <CodeBlock language={example.language}>{example.code}</CodeBlock>
                    </div>
                </div>
            ))}
        </div>
    );
}
