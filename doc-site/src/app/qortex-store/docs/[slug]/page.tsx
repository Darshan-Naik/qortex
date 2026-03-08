import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoreNavItemByHref, getStoreSectionByHref } from '@/lib/navigation-store';
import { getDocumentation } from '@/lib/documentation';
import { DocumentationRenderer } from '@/components/documentation';

interface PageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const documentation = await getDocumentation(params.slug, 'qortex-store');

    if (!documentation) {
        return { title: 'Not Found' };
    }

    return {
        title: `${documentation.title} | qortex-store`,
        description: documentation.description || `Documentation for ${documentation.title}`,
    };
}

export default async function StoreDocPage({ params }: PageProps) {
    const href = `/qortex-store/docs/${params.slug}`;
    const item = getStoreNavItemByHref(href);
    const section = getStoreSectionByHref(href);
    const documentation = await getDocumentation(params.slug, 'qortex-store');

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
