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
            { title: "Installation", href: "/qortex-core/docs/installation" },
            { title: "Quick Start", href: "/qortex-core/docs/quick-start" },
        ],
    },
    {
        title: "Core APIs",
        items: [
            { title: "registerFetcher", href: "/qortex-core/docs/registerFetcher" },
            { title: "fetchQuery", href: "/qortex-core/docs/fetchQuery" },
            { title: "getQueryData", href: "/qortex-core/docs/getQueryData" },
            { title: "setQueryData", href: "/qortex-core/docs/setQueryData" },
            { title: "getQueryState", href: "/qortex-core/docs/getQueryState" },
            { title: "invalidateQuery", href: "/qortex-core/docs/invalidateQuery" },
            { title: "subscribeQuery", href: "/qortex-core/docs/subscribeQuery" },
        ],
    },
    {
        title: "Advanced",
        items: [
            { title: "setDefaultConfig", href: "/qortex-core/docs/setDefaultConfig" },
            { title: "createPersister", href: "/qortex-core/docs/createPersister" },
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
