import type { Form } from "qortex-form";

/**
 * Bound action methods returned alongside form snapshots in `useForm`.
 */
export function bindFormActions<T>(form: Form<T>) {
    return {
        set: form.set.bind(form),
        setMany: form.setMany.bind(form),
        reset: form.reset.bind(form),
        resetDraft: form.resetDraft.bind(form),
        touch: form.touch.bind(form),
        save: form.save.bind(form),
        validate: form.validate.bind(form),
        validateField: form.validateField.bind(form),
        validateFields: form.validateFields.bind(form),
        setData: form.setData.bind(form),
    };
}

/**
 * Normalize a form `key` (string | number | tuple) for React memoization
 * and persist key derivation.
 */
export function serializeKey(key: unknown): string {
    if (key == null) return "";
    if (Array.isArray(key)) return key.map(String).join("#");
    return String(key);
}
