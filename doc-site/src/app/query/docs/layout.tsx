'use client';

import { coreNavigation } from '@/lib/navigation-query';
import { PackageDocsLayout } from '@/components/layout/PackageDocsLayout';
import { CoreIcon } from '@/components/icons/PackageIcons';

export default function CoreDocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <PackageDocsLayout
            navigation={coreNavigation}
            packageName="qortex-query"
            packageIcon={<CoreIcon className="h-5 w-5 text-white" />}
            packageHref="/query"
            themeColor="purple"
        >
            {children}
        </PackageDocsLayout>
    );
}
