'use client';

import { resourceReactNavigation } from '@/lib/navigation-resource-react';
import { PackageDocsLayout } from '@/components/layout/PackageDocsLayout';
import { ResourceIcon } from '@/components/icons/PackageIcons';

export default function ResourceReactDocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <PackageDocsLayout
            navigation={resourceReactNavigation}
            packageName="qortex-resource-react"
            packageIcon={<ResourceIcon className="h-5 w-5 text-white" />}
            packageHref="/resource-react"
            themeColor="orange"
        >
            {children}
        </PackageDocsLayout>
    );
}
