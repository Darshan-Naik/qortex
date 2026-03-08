'use client';

import { dbNavigation } from '@/lib/navigation-db';
import { PackageDocsLayout } from '@/components/layout/PackageDocsLayout';
import { DbIcon } from '@/components/icons/PackageIcons';

export default function DbDocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <PackageDocsLayout
            navigation={dbNavigation}
            packageName="@qortex/db"
            packageIcon={<DbIcon className="h-5 w-5 text-white" />}
            packageHref="/db"
            themeColor="indigo"
        >
            {children}
        </PackageDocsLayout>
    );
}
