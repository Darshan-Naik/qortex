'use client';

import { resourceNavigation } from '@/lib/navigation-resource';
import { PackageDocsLayout } from '@/components/layout/PackageDocsLayout';
import { ResourceIcon } from '@/components/icons/PackageIcons';

export default function ResourceDocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <PackageDocsLayout
            navigation={resourceNavigation}
            packageName="qortex-resource"
            packageIcon={<ResourceIcon className="h-5 w-5 text-white" />}
            packageHref="/resource"
            themeColor="orange"
        >
            {children}
        </PackageDocsLayout>
    );
}
