export interface NavigationItem {
    title: string;
    href: string;
}

export interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

export const resourceReactNavigation: NavigationSection[] = [
    {
        title: "Getting Started",
        items: [
            { title: "Installation", href: "/resource-react/docs/installation" },
            { title: "Quick Start", href: "/resource-react/docs/quick-start" },
        ],
    },
    {
        title: "Guides",
        items: [
            { title: "Sharing Patterns", href: "/resource-react/docs/sharing-patterns" },
            { title: "Dynamic Identity", href: "/resource-react/docs/dynamic-identity" },
            { title: "React Recipes", href: "/resource-react/docs/recipes" },
            { title: "Multi-step Form", href: "/resource-react/docs/multi-step" },
            { title: "Row Editing", href: "/resource-react/docs/row-editing" },
        ],
    },
    {
        title: "React Hooks",
        items: [
            { title: "useResource", href: "/resource-react/docs/useResource" },
            { title: "useField", href: "/resource-react/docs/useField" },
            { title: "useFieldArray", href: "/resource-react/docs/useFieldArray" },
            { title: "useCollection", href: "/resource-react/docs/useCollection" },
            { title: "createResourceHooks", href: "/resource-react/docs/createResourceHooks" },
        ],
    },
];

export function getResourceReactNavItemByHref(href: string): NavigationItem | null {
    for (const section of resourceReactNavigation) {
        const item = section.items.find((item) => item.href === href);
        if (item) return item;
    }
    return null;
}

export function getResourceReactSectionByHref(href: string): NavigationSection | null {
    for (const section of resourceReactNavigation) {
        if (section.items.find((item) => item.href === href)) return section;
    }
    return null;
}
