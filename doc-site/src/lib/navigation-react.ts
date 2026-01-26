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
            { title: "Installation", href: "/qortex-react/docs/installation" },
            { title: "Quick Start", href: "/qortex-react/docs/quick-start" },
        ],
    },
    {
        title: "React Hooks",
        items: [
            { title: "useQuery", href: "/qortex-react/docs/useQuery" },
            { title: "useMutate", href: "/qortex-react/docs/useMutate" },
            { title: "useQueryData", href: "/qortex-react/docs/useQueryData" },
            { title: "useQuerySelect", href: "/qortex-react/docs/useQuerySelect" },
        ],
    },
    {
        title: "Core APIs",
        items: [
            { title: "registerFetcher", href: "/qortex-react/docs/registerFetcher" },
            { title: "fetchQuery", href: "/qortex-react/docs/fetchQuery" },
            { title: "getQueryData", href: "/qortex-react/docs/getQueryData" },
            { title: "setQueryData", href: "/qortex-react/docs/setQueryData" },
            { title: "invalidateQuery", href: "/qortex-react/docs/invalidateQuery" },
        ],
    },
    {
        title: "Advanced",
        items: [
            { title: "createPersister", href: "/qortex-react/docs/createPersister" },
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
