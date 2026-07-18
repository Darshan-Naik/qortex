import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useFieldArray } from '../src/index';
import { createResource } from 'qortex-resource';
import type { Resource } from 'qortex-resource';

describe('useFieldArray Hook', () => {
    let resource: Resource<any>;

    beforeEach(() => {
        resource = createResource({
            initialData: { tags: ['react', 'typescript'] }
        });
    });

    const FieldArrayComponent = () => {
        const { fields, append, remove, swap } = useFieldArray(resource, 'tags');

        return (
            <div>
                <ul data-testid="list">
                    {fields.map((field, index) => (
                        <li key={field.id} data-testid={`item-${index}`}>
                            {field.item}
                            <button data-testid={`remove-${index}`} onClick={() => remove(index)}>Remove</button>
                        </li>
                    ))}
                </ul>
                <button data-testid="append" onClick={() => append('jest')}>Append</button>
                <button data-testid="swap" onClick={() => swap(0, 1)}>Swap 0 & 1</button>
            </div>
        );
    };

    it('should render initial array items', () => {
        render(<FieldArrayComponent />);
        
        expect(screen.getByTestId('item-0')).toHaveTextContent('react');
        expect(screen.getByTestId('item-1')).toHaveTextContent('typescript');
    });

    it('should append items', () => {
        render(<FieldArrayComponent />);
        
        act(() => {
            screen.getByTestId('append').click();
        });

        expect(screen.getByTestId('item-2')).toHaveTextContent('jest');
        expect(resource.draft.tags).toEqual(['react', 'typescript', 'jest']);
    });

    it('should remove items', () => {
        render(<FieldArrayComponent />);
        
        act(() => {
            screen.getByTestId('remove-0').click();
        });

        // After removing index 0 ('react'), 'typescript' should be at index 0
        expect(screen.getByTestId('item-0')).toHaveTextContent('typescript');
        expect(screen.queryByTestId('item-1')).toBeNull();
        expect(resource.draft.tags).toEqual(['typescript']);
    });

    it('should swap items', () => {
        render(<FieldArrayComponent />);
        
        act(() => {
            screen.getByTestId('swap').click();
        });

        expect(screen.getByTestId('item-0')).toHaveTextContent('typescript');
        expect(screen.getByTestId('item-1')).toHaveTextContent('react');
        expect(resource.draft.tags).toEqual(['typescript', 'react']);
    });
});
