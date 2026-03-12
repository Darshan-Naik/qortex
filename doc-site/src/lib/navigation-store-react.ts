export interface NavigationItem {
    title: string;
    href: string;
}

export interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

export const storeReactNavigation: NavigationSection[] = [
    {
        title: "Getting Started",
        items: [
            { title: "Installation", href: "/store-react/docs/installation" },
            { title: "Quick Start", href: "/store-react/docs/quick-start" },
        ],
    },
    {
        title: "Core API",
        items: [
            { title: "createStore", href: "/store-react/docs/createStore" },
        ],
    },
    {
        title: "React Hooks",
        items: [
            { title: "useStore", href: "/store-react/docs/useStore" },
            { title: "createUseStore", href: "/store-react/docs/createUseStore" },
        ],
    },
];

export function getStoreReactNavItemByHref(href: string): NavigationItem | null {
    for (const section of storeReactNavigation) {
        const item = section.items.find((item) => item.href === href);
        if (item) return item;
    }
    return null;
}

export function getStoreReactSectionByHref(href: string): NavigationSection | null {
    for (const section of storeReactNavigation) {
        if (section.items.find((item) => item.href === href)) return section;
    }
    return null;
}
