# qortex-form

**Status: Alpha (`0.1.0-alpha.0`)** — APIs may change before 1.0.

Headless form engine: **source data → draft → validate → persist → save (mutator)**.

Does not fetch data or own query/mutation state — pair with `qortex-query` (or any loader) and pass `data` / `setData`.

## Install

```bash
npm install qortex-form@0.1.0-alpha.0
```

For React, install `qortex-form-react` (depends on this package). Optional query/store binders live at `qortex-form-react/query` and `qortex-form-react/store`.

## Quick example

```ts
import { createForm } from "qortex-form";

const user = createForm({
  key: ["user", id],
  data: serverUser,
  persist: { draft: true },
  validate: {
    fields: { name: (v) => (!v ? "Required" : null) },
  },
});

user.set("name", "Ada");
await user.save(async (draft) => api.updateUser(id, draft));
// On success: draft resets. Mutator result is NOT applied as `data`.
```
