import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createForm } from 'qortex-form';
import { FormProvider, useField } from '../src/index';

describe('useField', () => {
    it('requires FormProvider', () => {
        const Broken = () => {
            useField('name');
            return null;
        };

        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<Broken />)).toThrow(/FormProvider/);
        spy.mockRestore();
    });

    it('updates field value and dirty state on change', () => {
        const form = createForm({
            initialData: { profile: { name: 'Alice', age: 25 } },
        });

        const FieldComponent = ({ fieldName }: { fieldName: string }) => {
            const field = useField(fieldName);
            return (
                <div>
                    <input
                        data-testid={`input-${fieldName}`}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                    />
                    <span data-testid={`dirty-${fieldName}`}>{field.isChanged ? 'true' : 'false'}</span>
                </div>
            );
        };

        render(
            <FormProvider form={form}>
                <FieldComponent fieldName="profile.name" />
                <FieldComponent fieldName="profile.age" />
            </FormProvider>,
        );

        const nameInput = screen.getByTestId('input-profile.name');
        const ageInput = screen.getByTestId('input-profile.age');

        expect((nameInput as HTMLInputElement).value).toBe('Alice');
        expect((ageInput as HTMLInputElement).value).toBe('25');

        act(() => {
            fireEvent.change(nameInput, { target: { value: 'Bob' } });
        });

        expect((nameInput as HTMLInputElement).value).toBe('Bob');
        expect((ageInput as HTMLInputElement).value).toBe('25');
        expect(screen.getByTestId('dirty-profile.name').textContent).toBe('true');
        expect(screen.getByTestId('dirty-profile.age').textContent).toBe('false');
        expect(form.draft?.profile.name).toBe('Bob');

        form.destroy();
    });
});
