export interface NavigationItem {
  title: string;
  href: string;
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
      },
      {
        title: "Quick Start",
        href: "/docs/quick-start",
      },
    ],
  },
  {
    title: "React Hooks",
    items: [
      {
        title: "useQuery",
        href: "/docs/useQuery",
      },
      {
        title: "useMutate",
        href: "/docs/useMutate",
      },
      {
        title: "useQueryData",
        href: "/docs/useQueryData",
      },
      {
        title: "useQuerySelect",
        href: "/docs/useQuerySelect",
      },
    ],
  },
  {
    title: "Core APIs",
    items: [
      {
        title: "registerFetcher",
        href: "/docs/registerFetcher",
      },
      {
        title: "fetchQuery",
        href: "/docs/fetchQuery",
      },
      {
        title: "getQueryData",
        href: "/docs/getQueryData",
      },
      {
        title: "getQueryState",
        href: "/docs/getQueryState",
      },
      {
        title: "setQueryData",
        href: "/docs/setQueryData",
      },
      {
        title: "invalidateQuery",
        href: "/docs/invalidateQuery",
      },
      {
        title: "subscribeQuery",
        href: "/docs/subscribeQuery",
      },
      {
        title: "setDefaultConfig",
        href: "/docs/setDefaultConfig",
      },
      {
        title: "dangerClearCache",
        href: "/docs/dangerClearCache",
      },
    ],
  },
  {
    title: "Persistence",
    items: [
      {
        title: "createPersister",
        href: "/docs/createPersister",
      },
      {
        title: "PersisterConfig",
        href: "/docs/PersisterConfig",
      },
    ],
  },
  {
    title: "Types",
    items: [
      {
        title: "QueryKey",
        href: "/docs/QueryKey",
      },
      {
        title: "QueryOptions",
        href: "/docs/QueryOptions",
      },
      {
        title: "QueryState",
        href: "/docs/QueryState",
      },
      {
        title: "UseMutateOptions",
        href: "/docs/UseMutateOptions",
      },
      {
        title: "UseMutateResult",
        href: "/docs/UseMutateResult",
      },
    ],
  },
  {
    title: "About",
    items: [
      {
        title: "License",
        href: "/docs/license",
      },
      {
        title: "Contributing",
        href: "/docs/contributing",
      },
    ],
  },
];

export function getNavigationItemByHref(href: string): NavigationItem | null {
  for (const section of navigationData) {
    const item = section.items.find((item) => item.href === href);
    if (item) return item;
  }
  return null;
}

export function getNavigationSectionByHref(
  href: string
): NavigationSection | null {
  for (const section of navigationData) {
    const item = section.items.find((item) => item.href === href);
    if (item) return section;
  }
  return null;
}
