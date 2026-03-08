import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCoreNavItemByHref, getCoreSectionByHref } from '@/lib/navigation-core';
import { getDocumentation } from '@/lib/documentation';
import { DocumentationRenderer } from '@/components/documentation';

interface PageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const documentation = await getDocumentation(params.slug, 'query');

    if (!documentation) {
        return { title: 'Not Found' };
    }

    return {
        title: `${documentation.title} | @qortex/query`,
        description: documentation.description || `Documentation for ${documentation.title}`,
    };
}

export default async function CoreDocPage({ params }: PageProps) {
    const href = `/query/docs/${params.slug}`;
    const item = getCoreNavItemByHref(href);
    const section = getCoreSectionByHref(href);
    const documentation = await getDocumentation(params.slug, 'query');

    if (!documentation) {
        notFound();
    }

    const breadcrumbSection = section?.title || documentation.category || 'Documentation';
    const breadcrumbTitle = item?.title || documentation.title;

    return (
        <div className="max-w-4xl">
            <nav className="text-sm text-gray-500 mb-6">
                <span className="hover:text-gray-700 transition-colors">{breadcrumbSection}</span>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">{breadcrumbTitle}</span>
            </nav>
            <DocumentationRenderer data={documentation} />
        </div>
    );
}
