'use client';

import { useState, memo } from 'react';
import { Menu } from 'lucide-react';
import { SidebarContent } from './SidebarContent';

export const DocSidebar = memo(function DocSidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-gray-900">Documentation</h1>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40">
                <div className="flex flex-col h-screen bg-white border-r border-gray-200">
                    <SidebarContent />
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />

                    {/* Sidebar */}
                    <div className="fixed inset-y-0 left-0 z-50 w-64 h-screen bg-white shadow-xl transform transition-transform">
                        <SidebarContent
                            onClose={() => setSidebarOpen(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
});