import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useForm, FormProvider, useField } from '../src/index';

describe('useForm', () => {
    it('subscribes to snapshot and exposes form', () => {
        const Shell = () => {
            const state = useForm({
                initialData: { name: 'Alice', score: 10 },
            });

            return (
                <div>
                    <span data-testid="name">{state.draft?.name}</span>
                    <span data-testid="score">{state.draft?.score}</span>
                    <span data-testid="isChanged">{state.isChanged ? 'true' : 'false'}</span>
                    <button data-testid="update" onClick={() => state.set('score', 20)}>
                        Update
                    </button>
                </div>
            );
        };

        render(<Shell />);

        expect(screen.getByTestId('name').textContent).toBe('Alice');
        expect(screen.getByTestId('score').textContent).toBe('10');
        expect(screen.getByTestId('isChanged').textContent).toBe('false');

        act(() => {
            screen.getByTestId('update').click();
        });

        expect(screen.getByTestId('score').textContent).toBe('20');
        expect(screen.getByTestId('isChanged').textContent).toBe('true');
    });

    it('FormProvider + useField work together', () => {
        const Shell = () => {
            const { form } = useForm({
                initialData: { profile: { name: 'Alice' } },
            });

            return (
                <FormProvider form={form}>
                    <NameField />
                </FormProvider>
            );
        };

        const NameField = () => {
            const field = useField('profile.name');
            return (
                <div>
                    <input
                        data-testid="input"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                    />
                    <span data-testid="dirty">{field.isChanged ? 'true' : 'false'}</span>
                </div>
            );
        };

        render(<Shell />);

        const input = screen.getByTestId('input') as HTMLInputElement;
        expect(input.value).toBe('Alice');

        act(() => {
            fireEvent.change(input, { target: { value: 'Bob' } });
        });

        expect(input.value).toBe('Bob');
        expect(screen.getByTestId('dirty').textContent).toBe('true');
    });

    it('syncs config.data via setData when it changes', () => {
        const Shell = ({ data }: { data: { name: string } }) => {
            const { draft, form } = useForm({
                key: 'user',
                data,
            });

            return (
                <FormProvider form={form}>
                    <span data-testid="name">{draft?.name}</span>
                </FormProvider>
            );
        };

        const { rerender } = render(<Shell data={{ name: 'Alice' }} />);
        expect(screen.getByTestId('name').textContent).toBe('Alice');

        rerender(<Shell data={{ name: 'Carol' }} />);
        expect(screen.getByTestId('name').textContent).toBe('Carol');
    });
});
