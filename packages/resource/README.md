# qortex-resource

**Status: Alpha (`0.1.0-alpha.0`)** — APIs may change before 1.0.

End-to-end entity/form lifecycle: **fetch → draft → validate → persist → save → feedback**.

## Install

```bash
npm install qortex-resource@0.1.0-alpha.0
```

For React apps, install only the React package (it depends on this core):

```bash
npm install qortex-resource-react@0.1.0-alpha.0
```

## Docs

See the doc site:

- Core: `/resource`
- React: `/resource-react`

## Quick example

```ts
import { createResource } from "qortex-resource";

const user = createResource({
  key: ["user", id],
  source: {
    fetch: () => api.getUser(id),
    save: (draft) => api.updateUser(id, draft),
  },
  persist: { draft: true },
});

user.set("name", "Ada");
await user.save();
```
