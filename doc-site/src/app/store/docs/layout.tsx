'use client';

import { storeNavigation } from '@/lib/navigation-store';
import { PackageDocsLayout } from '@/components/layout/PackageDocsLayout';
import { StoreIcon } from '@/components/icons/PackageIcons';

export default function StoreDocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <PackageDocsLayout
            navigation={storeNavigation}
            packageName="@qortex/store"
            packageIcon={<StoreIcon className="h-5 w-5 text-white" />}
            packageHref="/store"
            themeColor="emerald"
        >
            {children}
        </PackageDocsLayout>
    );
}
