'use client';

import { Layers } from 'lucide-react';
import { coreNavigation } from '@/lib/navigation-core';
import { PackageDocsLayout } from '@/components/layout/PackageDocsLayout';

export default function CoreDocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <PackageDocsLayout
            navigation={coreNavigation}
            packageName="qortex-core"
            packageIcon={<Layers className="h-5 w-5 text-white" />}
            packageHref="/qortex-core"
            themeColor="purple"
        >
            {children}
        </PackageDocsLayout>
    );
}
