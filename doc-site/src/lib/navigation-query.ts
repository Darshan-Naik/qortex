export interface NavigationItem {
    title: string;
    href: string;
}

export interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

export const coreNavigation: NavigationSection[] = [
    {
        title: "Getting Started",
        items: [
            { title: "Installation", href: "/query/docs/installation" },
            { title: "Quick Start", href: "/query/docs/quick-start" },
        ],
    },
    {
        title: "Core APIs",
        items: [
            { title: "registerFetcher", href: "/query/docs/registerFetcher" },
            { title: "fetchQuery", href: "/query/docs/fetchQuery" },
            { title: "getQueryData", href: "/query/docs/getQueryData" },
            { title: "setQueryData", href: "/query/docs/setQueryData" },
            { title: "getQueryState", href: "/query/docs/getQueryState" },
            { title: "invalidateQuery", href: "/query/docs/invalidateQuery" },
            { title: "subscribeQuery", href: "/query/docs/subscribeQuery" },
        ],
    },
    {
        title: "Advanced",
        items: [
            { title: "setDefaultConfig", href: "/query/docs/setDefaultConfig" },
            { title: "createPersister", href: "/query/docs/createPersister" },
        ],
    },
];

export function getCoreNavItemByHref(href: string): NavigationItem | null {
    for (const section of coreNavigation) {
        const item = section.items.find((item) => item.href === href);
        if (item) return item;
    }
    return null;
}

export function getCoreSectionByHref(href: string): NavigationSection | null {
    for (const section of coreNavigation) {
        if (section.items.find((item) => item.href === href)) return section;
    }
    return null;
}
