export interface NavigationItem {
    title: string;
    href: string;
    description?: string;
}

export interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

export const navigationData: NavigationSection[] = [
    {
        title: "Getting Started",
        items: [
            {
                title: "Installation",
                href: "/docs/installation",
                description: "Install qortex in your project"
            },
            {
                title: "Quick Start",
                href: "/docs/quick-start",
                description: "Get up and running in minutes"
            }
        ]
    },
    {
        title: "React Hooks",
        items: [
            {
                title: "useQuery",
                href: "/docs/useQuery",
                description: "Main hook for reactive data fetching"
            },
            {
                title: "useQueryData",
                href: "/docs/useQueryData",
                description: "Hook that returns only the data value"
            },
            {
                title: "useQuerySelect",
                href: "/docs/useQuerySelect",
                description: "Optimized hook with smart subscription"
            }
        ]
    },
    {
        title: "Core APIs",
        items: [
            {
                title: "registerFetcher",
                href: "/docs/registerFetcher",
                description: "Register a fetcher function for a query"
            },
            {
                title: "fetchQuery",
                href: "/docs/fetchQuery",
                description: "Execute a fetch operation"
            },
            {
                title: "getQueryData",
                href: "/docs/getQueryData",
                description: "Get current data for a query"
            },
            {
                title: "getQueryState",
                href: "/docs/getQueryState",
                description: "Get complete query state"
            },
            {
                title: "setQueryData",
                href: "/docs/setQueryData",
                description: "Manually set query data"
            },
            {
                title: "invalidateQuery",
                href: "/docs/invalidateQuery",
                description: "Invalidate and refetch a query"
            },
            {
                title: "subscribeQuery",
                href: "/docs/subscribeQuery",
                description: "Subscribe to query state changes"
            },
            {
                title: "setDefaultConfig",
                href: "/docs/setDefaultConfig",
                description: "Set default configuration"
            },
            {
                title: "dangerClearCache",
                href: "/docs/dangerClearCache",
                description: "Clear all cached data (testing only)"
            }
        ]
    },
    {
        title: "Persistence",
        items: [
            {
                title: "createPersister",
                href: "/docs/createPersister",
                description: "Create a persister instance"
            },
            {
                title: "PersisterConfig",
                href: "/docs/PersisterConfig",
                description: "Configuration options for persisters"
            }
        ]
    },
    {
        title: "Types",
        items: [
            {
                title: "QueryKey",
                href: "/docs/QueryKey",
                description: "Query key type definition"
            },
            {
                title: "QueryOptions",
                href: "/docs/QueryOptions",
                description: "Query configuration options"
            },
            {
                title: "QueryState",
                href: "/docs/QueryState",
                description: "Query state type definition"
            }
        ]
    },
    {
        title: "About",
        items: [
            {
                title: "License",
                href: "/docs/license",
                description: "License information"
            },
            {
                title: "Contributing",
                href: "/docs/contributing",
                description: "How to contribute to qortex"
            }
        ]
    }
];

export function getNavigationItemByHref(href: string): NavigationItem | null {
    for (const section of navigationData) {
        const item = section.items.find(item => item.href === href);
        if (item) return item;
    }
    return null;
}

export function getNavigationSectionByHref(href: string): NavigationSection | null {
    for (const section of navigationData) {
        const item = section.items.find(item => item.href === href);
        if (item) return section;
    }
    return null;
}
