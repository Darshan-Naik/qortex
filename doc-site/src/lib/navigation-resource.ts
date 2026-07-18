export interface NavigationItem {
    title: string;
    href: string;
}

export interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

export const resourceNavigation: NavigationSection[] = [
    {
        title: "Getting Started",
        items: [
            { title: "Installation", href: "/resource/docs/installation" },
            { title: "Quick Start", href: "/resource/docs/quick-start" },
            { title: "Concepts", href: "/resource/docs/concepts" },
            { title: "Lifecycle", href: "/resource/docs/lifecycle" },
        ],
    },
    {
        title: "Guides",
        items: [
            { title: "Sources", href: "/resource/docs/sources" },
            { title: "Validation", href: "/resource/docs/validation" },
            { title: "Persistence", href: "/resource/docs/persistence" },
            { title: "Optimistic Updates", href: "/resource/docs/optimistic" },
            { title: "Product Form Example", href: "/resource/docs/product-form" },
            { title: "Alpha Limitations", href: "/resource/docs/alpha-limitations" },
        ],
    },
    {
        title: "API",
        items: [
            { title: "createResource", href: "/resource/docs/createResource" },
            { title: "createCollection", href: "/resource/docs/createCollection" },
            { title: "zodResolver", href: "/resource/docs/zodResolver" },
        ],
    },
];

export function getResourceNavItemByHref(href: string): NavigationItem | null {
    for (const section of resourceNavigation) {
        const item = section.items.find((item) => item.href === href);
        if (item) return item;
    }
    return null;
}

export function getResourceSectionByHref(href: string): NavigationSection | null {
    for (const section of resourceNavigation) {
        if (section.items.find((item) => item.href === href)) return section;
    }
    return null;
}
