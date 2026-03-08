import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDbNavItemByHref, getDbSectionByHref } from '@/lib/navigation-db';
import { getDocumentation } from '@/lib/documentation';
import { DocumentationRenderer } from '@/components/documentation';

interface PageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const documentation = await getDocumentation(params.slug, 'db');

    if (!documentation) {
        return { title: 'Not Found' };
    }

    return {
        title: `${documentation.title} | qortex-db`,
        description: documentation.description || `Documentation for ${documentation.title}`,
    };
}

export default async function DbDocPage({ params }: PageProps) {
    const href = `/db/docs/${params.slug}`;
    const item = getDbNavItemByHref(href);
    const section = getDbSectionByHref(href);
    const documentation = await getDocumentation(params.slug, 'db');

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
