export interface NavigationItem {
    title: string;
    href: string;
}

export interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

export const formReactNavigation: NavigationSection[] = [
    {
        title: "Getting Started",
        items: [
            { title: "Installation", href: "/form-react/docs/installation" },
            { title: "Quick Start", href: "/form-react/docs/quick-start" },
        ],
    },
    {
        title: "React API",
        items: [
            { title: "useForm", href: "/form-react/docs/useForm" },
            { title: "FormProvider", href: "/form-react/docs/FormProvider" },
            { title: "useField", href: "/form-react/docs/useField" },
            { title: "useFieldArray", href: "/form-react/docs/useFieldArray" },
            { title: "Sharing patterns", href: "/form-react/docs/sharing-patterns" },
        ],
    },
    {
        title: "Binders",
        items: [
            { title: "useQueryForm", href: "/form-react/docs/useQueryForm" },
            { title: "useFormQuery", href: "/form-react/docs/useFormQuery" },
            { title: "useFormMutation", href: "/form-react/docs/useFormMutation" },
            { title: "useFormStore", href: "/form-react/docs/useFormStore" },
        ],
    },
    {
        title: "Guides",
        items: [
            { title: "Recipes", href: "/form-react/docs/recipes" },
        ],
    },
];

export function getFormReactNavItemByHref(href: string): NavigationItem | null {
    for (const section of formReactNavigation) {
        const item = section.items.find((item) => item.href === href);
        if (item) return item;
    }
    return null;
}

export function getFormReactSectionByHref(href: string): NavigationSection | null {
    for (const section of formReactNavigation) {
        if (section.items.find((item) => item.href === href)) return section;
    }
    return null;
}
