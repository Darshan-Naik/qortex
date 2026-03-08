'use client';

import { storeReactNavigation } from '@/lib/navigation-store-react';
import { PackageDocsLayout } from '@/components/layout/PackageDocsLayout';
import { StoreIcon } from '@/components/icons/PackageIcons';

export default function StoreReactDocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <PackageDocsLayout
            navigation={storeReactNavigation}
            packageName="@qortex/store-react"
            packageIcon={<StoreIcon className="h-5 w-5 text-white" />}
            packageHref="/store-react"
            themeColor="emerald"
        >
            {children}
        </PackageDocsLayout>
    );
}
