'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, X, Layers } from 'lucide-react';
import { NavigationSection } from '@/lib/navigation-query';

interface PackageSidebarProps {
    navigation: NavigationSection[];
    packageName: string;
    packageIcon: React.ReactNode;
    packageHref: string;
    themeColor: 'purple' | 'blue' | 'indigo' | 'emerald' | 'orange';
    onClose?: () => void;
}

const colorClasses = {
    purple: {
        bg: 'from-purple-50 to-violet-50',
        icon: 'from-purple-600 to-violet-600',
        active: 'bg-purple-100 text-purple-900',
    },
    blue: {
        bg: 'from-blue-50 to-cyan-50',
        icon: 'from-blue-600 to-cyan-600',
        active: 'bg-blue-100 text-blue-900',
    },
    indigo: {
        bg: 'from-indigo-50 to-blue-50',
        icon: 'from-indigo-600 to-blue-600',
        active: 'bg-indigo-100 text-indigo-900',
    },
    emerald: {
        bg: 'from-emerald-50 to-teal-50',
        icon: 'from-emerald-600 to-teal-600',
        active: 'bg-emerald-100 text-emerald-900',
    },
    orange: {
        bg: 'from-orange-50 to-amber-50',
        icon: 'from-orange-600 to-amber-600',
        active: 'bg-orange-100 text-orange-900',
    },
};

export const PackageSidebar = memo(function PackageSidebar({
    navigation,
    packageName,
    packageIcon,
    packageHref,
    themeColor,
    onClose,
}: PackageSidebarProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(navigation.map(s => s.title))
    );
    const pathname = usePathname();
    const colors = colorClasses[themeColor];

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
        const normalize = (p: string) => p.endsWith('/') ? p.slice(0, -1) : p;
        return normalize(pathname || '') === normalize(href);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className={`py-3 px-4 border-b border-gray-200 bg-gradient-to-r ${colors.bg}`}>
                <div className="flex items-center justify-between">
                    <Link href={packageHref} className="flex items-center space-x-3 group">
                        <div className={`w-8 h-8 bg-gradient-to-r ${colors.icon} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
                            {packageIcon}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{packageName}</h2>
                            <p className="text-xs text-gray-600">Documentation</p>
                        </div>
                    </Link>
                    {onClose && (
                        <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto bg-white">
                <div className="p-3">
                    <ul className="space-y-1">
                        {navigation.map((section) => (
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
                                                        e.stopPropagation();
                                                        if (window.innerWidth < 1024 && onClose) {
                                                            onClose();
                                                        }
                                                    }}
                                                    className={`block px-2 py-1.5 text-sm rounded-md transition-all duration-200 ${isActive(item.href)
                                                        ? `${colors.active} font-semibold shadow-sm`
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
