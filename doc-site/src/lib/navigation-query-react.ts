export interface NavigationItem {
    title: string;
    href: string;
}

export interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

export const reactNavigation: NavigationSection[] = [
    {
        title: "Getting Started",
        items: [
            { title: "Installation", href: "/query-react/docs/installation" },
            { title: "Quick Start", href: "/query-react/docs/quick-start" },
        ],
    },
    {
        title: "React Hooks",
        items: [
            { title: "useQuery", href: "/query-react/docs/useQuery" },
            { title: "useMutate", href: "/query-react/docs/useMutate" },
            { title: "useQueryData", href: "/query-react/docs/useQueryData" },
            { title: "useQuerySelect", href: "/query-react/docs/useQuerySelect" },
        ],
    },
    {
        title: "Core APIs",
        items: [
            { title: "registerFetcher", href: "/query-react/docs/registerFetcher" },
            { title: "fetchQuery", href: "/query-react/docs/fetchQuery" },
            { title: "getQueryData", href: "/query-react/docs/getQueryData" },
            { title: "setQueryData", href: "/query-react/docs/setQueryData" },
            { title: "invalidateQuery", href: "/query-react/docs/invalidateQuery" },
        ],
    },
    {
        title: "Advanced",
        items: [
            { title: "Persistence (qortex-db)", href: "/db/docs/createQueryPersister" },
        ],
    },
];

export function getReactNavItemByHref(href: string): NavigationItem | null {
    for (const section of reactNavigation) {
        const item = section.items.find((item) => item.href === href);
        if (item) return item;
    }
    return null;
}

export function getReactSectionByHref(href: string): NavigationSection | null {
    for (const section of reactNavigation) {
        if (section.items.find((item) => item.href === href)) return section;
    }
    return null;
}
