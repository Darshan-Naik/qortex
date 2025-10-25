import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNavigationItemByHref, getNavigationSectionByHref } from '@/lib/navigation';
import { getDocumentation } from '@/lib/documentation';
import { DocumentationRenderer } from '@/components/documentation';

interface PageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const href = `/docs/${params.slug}`;
    const item = getNavigationItemByHref(href);

    if (!item) {
        return {
            title: 'Not Found',
        };
    }

    return {
        title: item.title,
        description: item.description || `Documentation for ${item.title}`,
    };
}

export default async function DocPage({ params }: PageProps) {
    const href = `/docs/${params.slug}`;
    const item = getNavigationItemByHref(href);
    const section = getNavigationSectionByHref(href);
    const documentation = await getDocumentation(params.slug);

    if (!item || !documentation) {
        notFound();
    }

    return (
        <div className="max-w-4xl">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-6">
                <span className="hover:text-gray-700 transition-colors">{section?.title}</span>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">{item.title}</span>
            </nav>

            {/* Content */}
            <DocumentationRenderer data={documentation} />
        </div>
    );
}

// Generate static params for all navigation items
export async function generateStaticParams() {
    const { getAllDocumentationSlugs } = await import('@/lib/documentation');
    const slugs = getAllDocumentationSlugs();

    return slugs.map(slug => ({
        slug,
    }));
}
