import Link from 'next/link';

interface RelatedPagesProps {
    pages: string[];
}

function resolveHref(page: string): string {
    if (page.startsWith('/')) return page;
    return `/docs/${page}`;
}

function labelFor(page: string): string {
    if (page.startsWith('/')) {
        const parts = page.split('/').filter(Boolean);
        return parts[parts.length - 1] || page;
    }
    return page;
}

export function RelatedPages({ pages }: RelatedPagesProps) {
    if (!pages || pages.length === 0) return null;

    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Related Pages</h4>
            <div className="flex flex-wrap gap-2">
                {pages.map((page, index) => (
                    <Link
                        key={index}
                        href={resolveHref(page)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-primary-600 bg-primary-100 hover:bg-primary-200 transition-colors"
                    >
                        {labelFor(page)}
                    </Link>
                ))}
            </div>
        </div>
    );
}
