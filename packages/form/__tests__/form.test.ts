import { createForm } from '../src/form';

describe('createForm', () => {
    it('creates with initialData and supports set', () => {
        const form = createForm({
            initialData: { name: 'Alice', score: 10 },
        });

        expect(form.data).toEqual({ name: 'Alice', score: 10 });
        expect(form.draft).toEqual({ name: 'Alice', score: 10 });
        expect(form.isChanged).toBe(false);

        form.set('score', 20);
        expect(form.draft?.score).toBe(20);
        expect(form.data?.score).toBe(10);
        expect(form.isChanged).toBe(true);
        expect(form.changedFields).toEqual(['score']);

        form.destroy();
    });

    it('validates fields', async () => {
        const form = createForm({
            initialData: { name: '' },
            validate: {
                fields: {
                    name: (v) => (!v ? 'Required' : null),
                },
            },
        });

        const ok = await form.validate();
        expect(ok).toBe(false);
        expect(form.fieldErrors.name).toBe('Required');
        expect(form.errors.name).toBe('Required');
        expect(form.isValid).toBe(false);

        form.set('name', 'Ada');
        const ok2 = await form.validate();
        expect(ok2).toBe(true);
        expect(form.isValid).toBe(true);

        form.destroy();
    });

    it('save(mutator) resets draft and does not apply mutator result as data', async () => {
        const form = createForm({
            initialData: { name: 'Alice' },
        });

        form.set('name', 'Bob');
        expect(form.isChanged).toBe(true);

        const result = await form.save(async (draft) => {
            expect(draft.name).toBe('Bob');
            return { name: 'Server' };
        });

        expect(result.success).toBe(true);
        expect(form.isChanged).toBe(false);
        expect(form.draft?.name).toBe('Alice');
        expect(form.data?.name).toBe('Alice');

        form.destroy();
    });

    it('save returns failure on validation error without calling mutator', async () => {
        const mutator = jest.fn();
        const form = createForm({
            initialData: { name: '' },
            validate: {
                fields: {
                    name: (v) => (!v ? 'Required' : null),
                },
            },
        });

        const result = await form.save(mutator);
        expect(result.success).toBe(false);
        expect(mutator).not.toHaveBeenCalled();

        form.destroy();
    });

    it('setData keepDirty preserves differing overrides', () => {
        const form = createForm({
            data: { name: 'Alice', score: 1 },
            sourceUpdate: 'keepDirty',
        });

        form.set('name', 'Bob');
        form.set('score', 2);

        form.setData({ name: 'Alice', score: 99 });

        expect(form.data).toEqual({ name: 'Alice', score: 99 });
        expect(form.draft?.name).toBe('Bob');
        expect(form.draft?.score).toBe(2);
        expect(form.isChanged).toBe(true);

        form.destroy();
    });

    it('uses config.data as source at create time', () => {
        const form = createForm({
            data: { id: 1, name: 'X' },
            initialData: { id: 0, name: 'Y' },
        });

        expect(form.data).toEqual({ id: 1, name: 'X' });
        form.destroy();
    });
});
