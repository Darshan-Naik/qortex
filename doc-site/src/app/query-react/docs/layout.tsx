'use client';

import { reactNavigation } from '@/lib/navigation-query-react';
import { PackageDocsLayout } from '@/components/layout/PackageDocsLayout';
import { ReactIcon } from '@/components/icons/PackageIcons';

export default function ReactDocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <PackageDocsLayout
            navigation={reactNavigation}
            packageName="qortex-query-react"
            packageIcon={<ReactIcon className="h-5 w-5 text-white" />}
            packageHref="/query-react"
            themeColor="blue"
        >
            {children}
        </PackageDocsLayout>
    );
}
