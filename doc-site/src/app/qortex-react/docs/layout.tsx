'use client';

import { RefreshCw } from 'lucide-react';
import { reactNavigation } from '@/lib/navigation-react';
import { PackageDocsLayout } from '@/components/layout/PackageDocsLayout';

export default function ReactDocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <PackageDocsLayout
            navigation={reactNavigation}
            packageName="qortex-react"
            packageIcon={<RefreshCw className="h-5 w-5 text-white" />}
            packageHref="/qortex-react"
            themeColor="blue"
        >
            {children}
        </PackageDocsLayout>
    );
}
