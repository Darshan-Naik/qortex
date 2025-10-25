'use client';

import { useState, useEffect, useRef, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, Menu, X, BrainCircuit } from 'lucide-react';
import { navigationData, NavigationSection } from '@/lib/navigation';

interface DocSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DocSidebar = memo(function DocSidebar({ isOpen, onClose }: DocSidebarProps) {
    const pathname = usePathname();
    const navRef = useRef<HTMLElement>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(['Getting Started', 'React Hooks'])
    );

    // Preserve scroll position and auto-expand active section
    useEffect(() => {
        const savedScrollPosition = sessionStorage.getItem('sidebar-scroll');
        if (savedScrollPosition && navRef.current) {
            navRef.current.scrollTop = parseInt(savedScrollPosition, 10);
        }

        // Auto-expand section containing the active item
        const activeSection = navigationData.find(section =>
            section.items.some(item => isActive(item.href))
        );

        if (activeSection) {
            setExpandedSections(prev => new Set(Array.from(prev).concat(activeSection.title)));
        }
    }, [pathname]);

    const saveScrollPosition = () => {
        if (navRef.current) {
            sessionStorage.setItem('sidebar-scroll', navRef.current.scrollTop.toString());
        }
    };

    const toggleSection = (sectionTitle: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionTitle)) {
            newExpanded.delete(sectionTitle);
        } else {
            newExpanded.add(sectionTitle);
        }
        setExpandedSections(newExpanded);
    };

    const isActive = (href: string) => {
        const currentSlug = pathname.split('/').filter(Boolean).join('');
        const targetSlug = href.split('/').filter(Boolean).join('');
        return currentSlug === targetSlug;

    };

    const SidebarContent = () => (
        <div className="h-full flex flex-col">
            {/* Header with Branding */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between mb-3">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                            <BrainCircuit className="text-white h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Qortex</h2>
                            <p className="text-xs text-gray-600">Documentation</p>
                        </div>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav
                ref={navRef}
                className="flex-1 overflow-y-auto bg-white"
                onScroll={saveScrollPosition}
            >
                <div className="p-4">
                    <ul className="space-y-2">
                        {navigationData.map((section) => (
                            <li key={section.title}>
                                <button
                                    onClick={() => toggleSection(section.title)}
                                    className="w-full flex items-center justify-between p-3 text-left text-sm font-semibold text-gray-800 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                                >
                                    <span>{section.title}</span>
                                    {expandedSections.has(section.title) ? (
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-500" />
                                    )}
                                </button>

                                {expandedSections.has(section.title) && (
                                    <ul className="ml-2 mt-2 space-y-1 border-l border-gray-200 pl-4">
                                        {section.items.map((item) => (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    onClick={() => {
                                                        // Close sidebar on mobile when item is clicked
                                                        if (window.innerWidth < 1024) {
                                                            onClose();
                                                        }
                                                    }}
                                                    className={`block p-3 text-sm rounded-lg transition-all duration-200 ${isActive(item.href)
                                                        ? 'bg-blue-100 text-primary-900 font-semibold shadow-lg transform scale-[1.02]'
                                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
                                                        }`}
                                                >
                                                    <div className="font-medium">{item.title}</div>
                                                    {item.description && (
                                                        <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40">
                <div className="flex flex-col h-screen bg-white border-r border-gray-200">
                    <SidebarContent />
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div className="lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity"
                        onClick={onClose}
                    />

                    {/* Sidebar */}
                    <div className="fixed inset-y-0 left-0 z-50 w-64 h-screen bg-white shadow-xl transform transition-transform">
                        <SidebarContent />
                    </div>
                </div>
            )}
        </>
    );
});

// Mobile menu button component
export const MobileMenuButton = memo(function MobileMenuButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
            <Menu className="h-5 w-5" />
        </button>
    );
});
