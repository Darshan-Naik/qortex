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
});
