'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { PackageSidebar } from '@/components/sidebar/PackageSidebar';
import { NavigationSection } from '@/lib/navigation-core';

interface PackageDocsLayoutProps {
    children: React.ReactNode;
    navigation: NavigationSection[];
    packageName: string;
    packageIcon: React.ReactNode;
    packageHref: string;
    themeColor: 'purple' | 'blue' | 'indigo';
}

export function PackageDocsLayout({
    children,
    navigation,
    packageName,
    packageIcon,
    packageHref,
    themeColor,
}: PackageDocsLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-600/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <PackageSidebar
                    navigation={navigation}
                    packageName={packageName}
                    packageIcon={packageIcon}
                    packageHref={packageHref}
                    themeColor={themeColor}
                    onClose={() => setSidebarOpen(false)}
                />
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r border-gray-200">
                <PackageSidebar
                    navigation={navigation}
                    packageName={packageName}
                    packageIcon={packageIcon}
                    packageHref={packageHref}
                    themeColor={themeColor}
                />
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Mobile header */}
                <div className="sticky top-0 z-30 lg:hidden bg-white border-b border-gray-200 px-4 py-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="font-medium">{packageName}</span>
                    </button>
                </div>

                <main className="py-6">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
