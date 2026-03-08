export interface NavigationItem {
    title: string;
    href: string;
}

export interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

export const storeNavigation: NavigationSection[] = [
    {
        title: "Getting Started",
        items: [
            { title: "Installation", href: "/store/docs/installation" },
            { title: "Quick Start", href: "/store/docs/quick-start" },
        ],
    },
    {
        title: "Core API",
        items: [
            { title: "createStore", href: "/store/docs/createStore" },
        ],
    },
];

export function getStoreNavItemByHref(href: string): NavigationItem | null {
    for (const section of storeNavigation) {
        const item = section.items.find((item) => item.href === href);
        if (item) return item;
    }
    return null;
}

export function getStoreSectionByHref(href: string): NavigationSection | null {
    for (const section of storeNavigation) {
        if (section.items.find((item) => item.href === href)) return section;
    }
    return null;
}
