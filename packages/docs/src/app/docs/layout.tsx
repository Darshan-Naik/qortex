'use client';

import { useState } from 'react';
import { DocSidebar, MobileMenuButton } from '@/components/DocSidebar';

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="min-h-screen bg-white">
            {/* Mobile header */}
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-gray-900">Documentation</h1>
                    <MobileMenuButton onClick={() => setSidebarOpen(true)} />
                </div>
            </div>

            {/* Sidebar */}
            <DocSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main content */}
            <div className="lg:pl-64">
                <main className="py-6">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
