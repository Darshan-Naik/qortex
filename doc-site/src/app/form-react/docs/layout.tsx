'use client';

import { formReactNavigation } from '@/lib/navigation-form-react';
import { PackageDocsLayout } from '@/components/layout/PackageDocsLayout';
import { ResourceIcon } from '@/components/icons/PackageIcons';

export default function FormReactDocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <PackageDocsLayout
            navigation={formReactNavigation}
            packageName="qortex-form-react"
            packageIcon={<ResourceIcon className="h-5 w-5 text-white" />}
            packageHref="/form-react"
            themeColor="orange"
        >
            {children}
        </PackageDocsLayout>
    );
}
