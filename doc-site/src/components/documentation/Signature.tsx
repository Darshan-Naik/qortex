import { CodeBlock } from '@/components/ui';

interface SignatureProps {
    language: string;
    code: string;
}

export function Signature({ language, code }: SignatureProps) {
    return (
        <div className="rounded-xl overflow-hidden">
            <CodeBlock language={language}>{code}</CodeBlock>
        </div>
    );
}
