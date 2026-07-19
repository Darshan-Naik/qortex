# qortex-form-react

**Status: Alpha (`0.1.0-alpha.0`)** — APIs may change before 1.0.

React bindings for `qortex-form`: `useForm`, `FormProvider`, `useField`, `useFieldArray`.

Optional binders compose with `qortex-query-react` / `qortex-store` via **separate entry points** so bare form users do not need those packages.

`useField` / `useFieldArray` are **context-only** — wrap with `FormProvider`.

## Install

```bash
npm install qortex-form-react@0.1.0-alpha.0
```

For query binders:

```bash
npm install qortex-query-react
```

## Quick example

```tsx
import { useForm, FormProvider, useField } from "qortex-form-react";

function ProfileForm({ data }: { data: User }) {
  const { form, isChanged, save, resetDraft } = useForm({
    key: data.id,
    data,
  });

  return (
    <FormProvider form={form}>
      <NameField />
      <button disabled={!isChanged} onClick={() => save((d) => api.save(d))}>
        Save
      </button>
      <button type="button" onClick={resetDraft}>Reset</button>
    </FormProvider>
  );
}

function NameField() {
  const { value, onChange, onBlur, error } = useField("name");
  return (
    <input
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      aria-invalid={!!error}
    />
  );
}
```

## Query binder (`useQueryForm`)

```tsx
import { useQueryForm } from "qortex-form-react/query";
import { useField } from "qortex-form-react";

function EditUser({ id }: { id: string }) {
  const { Provider, save, isLoading, isSaving, isChanged } = useQueryForm({
    key: ["user", id],
    fetcher: () => api.getUser(id),
    mutationFn: (draft) => api.updateUser(id, draft),
  });

  if (isLoading) return <p>Loading…</p>;

  return (
    <Provider>
      <NameField />
      <button disabled={!isChanged || isSaving} onClick={() => save()}>
        {isSaving ? "Saving…" : "Save"}
      </button>
    </Provider>
  );
}

function NameField() {
  const { value, onChange, onBlur, error } = useField("name");
  return (
    <input
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      aria-invalid={!!error}
    />
  );
}
```

Create-only (no fetcher):

```tsx
const { Provider, save, isSaving } = useQueryForm({
  key: ["user", "new"],
  initialData: { name: "", email: "" },
  mutationFn: (draft) => api.createUser(draft),
});
```

## Store binder

```tsx
import { useFormStore } from "qortex-form-react/store";

const { form, isChanged, save } = useFormStore({
  store: settingsStore,
  selector: (s) => s.profile,
});
// On save success: draft resets. Update the store in your mutator if needed.
```

## Exports

| Entry | Exports |
|-------|---------|
| `qortex-form-react` | `useForm`, `FormProvider`, `useFormContext`, `useField`, `useFieldArray` |
| `qortex-form-react/query` | `useQueryForm`, `useFormMutation` |
| `qortex-form-react/store` | `useFormStore` |
