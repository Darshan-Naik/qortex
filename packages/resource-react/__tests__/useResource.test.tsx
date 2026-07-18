import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useResource, createResourceHooks } from '../src/index';

describe('useResource Hook', () => {
    let resourceConfig: any;

    beforeEach(() => {
        resourceConfig = {
            initialData: { name: 'Alice', score: 10 },
            source: {
                save: async (draft: any) => ({ ...draft, name: 'Bob' })
            }
        };
    });

    const TestComponent = () => {
        const state = useResource(resourceConfig);

        return (
            <div>
                <span data-testid="status">{state.status}</span>
                <span data-testid="mutationStatus">{state.mutation.status}</span>
                <span data-testid="name">{state.draft?.name}</span>
                <span data-testid="score">{state.draft?.score}</span>
                <span data-testid="isChanged">{state.isChanged ? 'true' : 'false'}</span>
                <button 
                    data-testid="update-btn" 
                    onClick={() => state.set('score', 20)}
                >
                    Update
                </button>
                <button 
                    data-testid="mutate-btn" 
                    onClick={() => state.save()}
                >
                    Mutate
                </button>
            </div>
        );
    };

    it('should initialize with correct state', () => {
        render(<TestComponent />);
        
        expect(screen.getByTestId('status').textContent).toBe('ready');
        expect(screen.getByTestId('name').textContent).toBe('Alice');
        expect(screen.getByTestId('score').textContent).toBe('10');
        expect(screen.getByTestId('isChanged').textContent).toBe('false');
    });

    it('should re-render when resource state changes', () => {
        render(<TestComponent />);
        
        act(() => {
            screen.getByTestId('update-btn').click();
        });

        expect(screen.getByTestId('score').textContent).toBe('20');
        expect(screen.getByTestId('isChanged').textContent).toBe('true');
    });

    it('should reflect mutation lifecycle', async () => {
        render(<TestComponent />);
        
        await act(async () => {
            screen.getByTestId('mutate-btn').click();
        });

        // The state should eventually transition to success and name updated
        expect(screen.getByTestId('mutationStatus').textContent).toBe('success');
        expect(screen.getByTestId('name').textContent).toBe('Bob');
        expect(screen.getByTestId('isChanged').textContent).toBe('false');
    });
});

describe('createResourceHooks Factory', () => {
    it('should return bound hooks', () => {
        const hooks = createResourceHooks({
            initialData: { foo: 'bar' }
        });
        
        expect(hooks.useResource).toBeDefined();
        expect(hooks.useField).toBeDefined();
        expect(hooks.useFieldArray).toBeDefined();
    });

    it('should recreate when factory params / key change', async () => {
        const fetchMock = jest.fn(async (id: string) => ({ id, name: `User ${id}` }));

        const { useResource, useField, destroy } = createResourceHooks((userId: string) => ({
            key: ['user', userId],
            initialData: { id: userId, name: '' },
            source: {
                fetch: () => fetchMock(userId),
            },
        }));

        const Shell = ({ userId }: { userId: string }) => {
            const { draft, isLoading } = useResource(userId);
            const name = useField('name');
            return (
                <div>
                    <span data-testid="id">{draft?.id}</span>
                    <span data-testid="name">{name.value as string}</span>
                    <span data-testid="loading">{isLoading ? 'yes' : 'no'}</span>
                </div>
            );
        };

        const { rerender } = render(<Shell userId="1" />);

        await act(async () => {
            await Promise.resolve();
        });

        expect(fetchMock).toHaveBeenCalledWith('1');
        expect(screen.getByTestId('id').textContent).toBe('1');

        rerender(<Shell userId="2" />);

        await act(async () => {
            await Promise.resolve();
        });

        expect(fetchMock).toHaveBeenCalledWith('2');
        expect(screen.getByTestId('id').textContent).toBe('2');

        destroy();
    });

    it('should throw when factory useResource is called without params', () => {
        const { useResource } = createResourceHooks((id: string) => ({
            key: id,
            initialData: { id },
        }));

        const Broken = () => {
            // @ts-expect-error params required
            useResource();
            return null;
        };

        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<Broken />)).toThrow(/requires params/);
        spy.mockRestore();
    });
});
