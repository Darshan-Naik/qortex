'use client';

import { Database } from 'lucide-react';
import { dbNavigation } from '@/lib/navigation-db';
import { PackageDocsLayout } from '@/components/layout/PackageDocsLayout';

export default function DbDocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <PackageDocsLayout
            navigation={dbNavigation}
            packageName="qortex-db"
            packageIcon={<Database className="h-5 w-5 text-white" />}
            packageHref="/qortex-db"
            themeColor="indigo"
        >
            {children}
        </PackageDocsLayout>
    );
}
