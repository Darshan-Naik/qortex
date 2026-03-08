'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';

interface CodeBlockProps {
    children: string;
    language?: string;
}

// Custom theme with better bash highlighting
const customTheme = {
    ...themes.vsDark,
    styles: [
        ...themes.vsDark.styles,
        // Enhanced bash highlighting
        {
            types: ['builtin', 'command'],
            style: {
                color: '#4EC9B0', // Cyan for commands
                fontWeight: 'bold' as const
            }
        },
        {
            types: ['flag', 'option'],
            style: {
                color: '#569CD6', // Blue for flags
                fontWeight: 'bold' as const
            }
        },
        {
            types: ['path', 'file'],
            style: {
                color: '#CE9178', // Orange for paths
            }
        },
        {
            types: ['variable'],
            style: {
                color: '#9CDCFE', // Light blue for variables
            }
        }
    ]
};

export function CodeBlock({ children, language = 'typescript' }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(children);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    // Enhanced code processing for bash
    const processCode = (code: string, lang: string) => {
        if (lang === 'bash' || lang === 'shell') {
            return code
                // Highlight common commands
                .replace(/^(npm|yarn|pnpm|git|cd|ls|mkdir|rm|cp|mv|cat|echo|grep|find|chmod|chown|sudo|apt|brew|docker|kubectl|curl|wget|ssh|scp|tar|zip|unzip|node|python|pip|conda)\b/gm, '🔧$1')
                // Highlight flags and options
                .replace(/(-\w+|--\w+)/g, '🚩$1')
                // Highlight paths
                .replace(/(\/[^\s]+)/g, '📁$1')
                // Highlight variables
                .replace(/\$(\w+)/g, '💲$1')
                // Highlight package names
                .replace(/(@?[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)/g, '📦$1')
                // Clean up markers
                .replace(/🔧/g, '')
                .replace(/🚩/g, '')
                .replace(/📁/g, '')
                .replace(/💲/g, '')
                .replace(/📦/g, '');
        }
        return code;
    };

    const processedCode = processCode(children, language);

    return (
        <div className="relative group">
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors shadow-sm"
                >
                    {copied ? (
                        <>
                            <Check className="h-3 w-3" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="h-3 w-3" />
                            Copy
                        </>
                    )}
                </button>
            </div>

            <Highlight
                code={processedCode}
                language={language}
                theme={customTheme}
            >
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                        className={`${className}  overflow-x-auto text-sm leading-relaxed border border-gray-800 shadow-2xl`}
                        style={{
                            ...style,
                            padding: '1.5rem',
                            background: '#1e1e1e',
                        }}
                    >
                        {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line })}>
                                {line.map((token, key) => {
                                    const tokenProps = getTokenProps({ token });

                                    // Enhanced styling for bash
                                    if (language === 'bash' || language === 'shell') {
                                        const content = token.content;

                                        // Comments (lines starting with #)
                                        if (/^#/.test(content)) {
                                            return <span key={key} {...tokenProps} style={{ ...tokenProps.style, color: '#6A9955', fontStyle: 'italic' }} />;
                                        }

                                        // Commands
                                        if (/^(npm|yarn|pnpm|git|cd|ls|mkdir|rm|cp|mv|cat|echo|grep|find|chmod|chown|sudo|apt|brew|docker|kubectl|curl|wget|ssh|scp|tar|zip|unzip|node|python|pip|conda|install|add)$/.test(content)) {
                                            return <span key={key} {...tokenProps} style={{ ...tokenProps.style, color: '#4EC9B0', fontWeight: 'bold' }} />;
                                        }

                                        // Flags
                                        if (/^(-\w+|--\w+)$/.test(content)) {
                                            return <span key={key} {...tokenProps} style={{ ...tokenProps.style, color: '#569CD6', fontWeight: 'bold' }} />;
                                        }

                                        // Paths
                                        if (/^\/[^\s]+$/.test(content)) {
                                            return <span key={key} {...tokenProps} style={{ ...tokenProps.style, color: '#CE9178' }} />;
                                        }

                                        // Variables
                                        if (/^\$\w+$/.test(content)) {
                                            return <span key={key} {...tokenProps} style={{ ...tokenProps.style, color: '#9CDCFE' }} />;
                                        }

                                        // Package names (@qortex/query, @qortex/query-react, etc.)
                                        if (/^qortex-(core|react)$/.test(content)) {
                                            return <span key={key} {...tokenProps} style={{ ...tokenProps.style, color: '#DCDCAA', fontWeight: 'bold' }} />;
                                        }

                                        // Other package names
                                        if (/^@?[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(content)) {
                                            return <span key={key} {...tokenProps} style={{ ...tokenProps.style, color: '#DCDCAA' }} />;
                                        }
                                    }

                                    return <span key={key} {...tokenProps} />;
                                })}
                            </div>
                        ))}
                    </pre>
                )}
            </Highlight>
        </div>
    );
}
