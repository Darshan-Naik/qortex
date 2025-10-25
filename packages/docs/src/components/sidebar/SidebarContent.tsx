'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, X, BrainCircuit } from 'lucide-react';
import { navigationData } from '@/lib/navigation';

interface SidebarContentProps {
    onClose?: () => void;
}

export const SidebarContent = memo(function SidebarContent({
    onClose
}: SidebarContentProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(['Getting Started', 'React Hooks'])
    );

    const toggleSection = (sectionTitle: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionTitle)) {
            newExpanded.delete(sectionTitle);
        } else {
            newExpanded.add(sectionTitle);
        }
        setExpandedSections(newExpanded);
    };
    const pathname = usePathname();

    const isActive = (href: string) => {
        const currentSlug = pathname.split('/').filter(Boolean).join('');
        const targetSlug = href.split('/').filter(Boolean).join('');
        return currentSlug === targetSlug;
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header with Branding */}
            <div className="py-2 px-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                            <BrainCircuit className="text-white h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Qortex</h2>
                            <p className="text-xs text-gray-600">Documentation</p>
                        </div>
                    </Link>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto bg-white">
                <div className="p-3">
                    <ul className="space-y-1">
                        {navigationData.map((section) => (
                            <li key={section.title}>
                                <button
                                    onClick={() => toggleSection(section.title)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-semibold text-gray-800 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                                >
                                    <span>{section.title}</span>
                                    {expandedSections.has(section.title) ? (
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-500" />
                                    )}
                                </button>

                                {expandedSections.has(section.title) && (
                                    <ul className="ml-2 mt-1 space-y-0.5 border-l border-gray-200 pl-3">
                                        {section.items.map((item) => (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    onClick={(e) => {
                                                        // Prevent event bubbling to avoid collapsing the section
                                                        e.stopPropagation();
                                                        // Close sidebar on mobile when item is clicked
                                                        if (window.innerWidth < 1024 && onClose) {
                                                            onClose();
                                                        }
                                                    }}
                                                    className={`block px-2 py-1.5 text-sm rounded-md transition-all duration-200 ${isActive(item.href)
                                                        ? 'bg-blue-100 text-primary-900 font-semibold shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {item.title}
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
});
