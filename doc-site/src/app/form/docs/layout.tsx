'use client';

import { formNavigation } from '@/lib/navigation-form';
import { PackageDocsLayout } from '@/components/layout/PackageDocsLayout';
import { ResourceIcon } from '@/components/icons/PackageIcons';

export default function FormDocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <PackageDocsLayout
            navigation={formNavigation}
            packageName="qortex-form"
            packageIcon={<ResourceIcon className="h-5 w-5 text-white" />}
            packageHref="/form"
            themeColor="orange"
        >
            {children}
        </PackageDocsLayout>
    );
}
