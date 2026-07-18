# qortex-resource-react

**Status: Alpha (`0.1.0-alpha.0`)** — APIs may change before 1.0.

React bindings for [`qortex-resource`](../resource): `useResource`, `useField`, `useFieldArray`, `useCollection`, `createResourceHooks`.

No React Context — pass a `Resource` or use module-bound hooks.

## Install

```bash
npm install qortex-resource-react@0.1.0-alpha.0
```

`qortex-resource` is a dependency and installs automatically. Peer: `react` ^18.2.

## Docs

Doc site: `/resource-react`

## Quick example

```tsx
import { useResource, useField } from "qortex-resource-react";

function Form() {
  const { resource, save, isChanged } = useResource({
    initialData: { name: "" },
    source: { save: (d) => api.save(d) },
  });
  const name = useField(resource, "name");
  return (
    <>
      <input
        value={name.value ?? ""}
        onChange={(e) => name.onChange(e.target.value)}
        onBlur={name.onBlur}
      />
      <button disabled={!isChanged} onClick={() => save()}>
        Save
      </button>
    </>
  );
}
```
