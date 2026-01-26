export interface NavigationItem {
    title: string;
    href: string;
}

export interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

export const dbNavigation: NavigationSection[] = [
    {
        title: "Getting Started",
        items: [
            { title: "Installation", href: "/qortex-db/docs/installation" },
            { title: "Quick Start", href: "/qortex-db/docs/quick-start" },
        ],
    },
    {
        title: "API",
        items: [
            { title: "createDB", href: "/qortex-db/docs/createDB" },
        ],
    },
    {
        title: "Drivers",
        items: [
            { title: "localStorage", href: "/qortex-db/docs/localStorage" },
            { title: "sessionStorage", href: "/qortex-db/docs/sessionStorage" },
            { title: "IndexedDB", href: "/qortex-db/docs/indexedDB" },
        ],
    },
];

export function getDbNavItemByHref(href: string): NavigationItem | null {
    for (const section of dbNavigation) {
        const item = section.items.find((item) => item.href === href);
        if (item) return item;
    }
    return null;
}

export function getDbSectionByHref(href: string): NavigationSection | null {
    for (const section of dbNavigation) {
        if (section.items.find((item) => item.href === href)) return section;
    }
    return null;
}
