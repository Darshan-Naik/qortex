export interface NavigationItem {
    title: string;
    href: string;
}

export interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

export const formNavigation: NavigationSection[] = [
    {
        title: "Getting Started",
        items: [
            { title: "Installation", href: "/form/docs/installation" },
            { title: "Quick Start", href: "/form/docs/quick-start" },
            { title: "Concepts", href: "/form/docs/concepts" },
        ],
    },
    {
        title: "API",
        items: [
            { title: "createForm", href: "/form/docs/createForm" },
            { title: "Validation", href: "/form/docs/validation" },
            { title: "zodResolver", href: "/form/docs/zodResolver" },
            { title: "Persist", href: "/form/docs/persist" },
            { title: "Fields & arrays", href: "/form/docs/fields-arrays" },
        ],
    },
    {
        title: "Guides",
        items: [
            { title: "Alpha limitations", href: "/form/docs/alpha-limitations" },
        ],
    },
];

export function getFormNavItemByHref(href: string): NavigationItem | null {
    for (const section of formNavigation) {
        const item = section.items.find((item) => item.href === href);
        if (item) return item;
    }
    return null;
}

export function getFormSectionByHref(href: string): NavigationSection | null {
    for (const section of formNavigation) {
        if (section.items.find((item) => item.href === href)) return section;
    }
    return null;
}
