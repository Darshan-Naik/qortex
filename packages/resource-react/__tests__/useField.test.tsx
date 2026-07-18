import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useField } from '../src/index';
import { createResource } from 'qortex-resource';
import type { Resource } from 'qortex-resource';

describe('useField Hook', () => {
    let resource: Resource<any>;

    beforeEach(() => {
        resource = createResource({
            initialData: { profile: { name: 'Alice', age: 25 } }
        });
    });

    const FieldComponent = ({ fieldName }: { fieldName: string }) => {
        const field = useField(resource, fieldName);

        return (
            <div>
                <input 
                    data-testid={`input-${fieldName}`}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                />
                <span data-testid={`dirty-${fieldName}`}>{field.isChanged ? 'true' : 'false'}</span>
                <span data-testid={`valid-${fieldName}`}>{!field.error ? 'true' : 'false'}</span>
                {field.error && <span data-testid={`error-${fieldName}`}>{field.error}</span>}
            </div>
        );
    };

    it('should initialize with correct field value', () => {
        render(<FieldComponent fieldName="profile.name" />);
        
        const input = screen.getByTestId('input-profile.name') as HTMLInputElement;
        expect(input.value).toBe('Alice');
        expect(screen.getByTestId('dirty-profile.name').textContent).toBe('false');
    });

    it('should update field value and dirty state on change', () => {
        render(<FieldComponent fieldName="profile.name" />);
        
        const input = screen.getByTestId('input-profile.name');
        
        act(() => {
            fireEvent.change(input, { target: { value: 'Bob' } });
        });
        
        expect((input as HTMLInputElement).value).toBe('Bob');
        expect(screen.getByTestId('dirty-profile.name').textContent).toBe('true');
        
        // Ensure the underlying resource was updated
        expect(resource.draft.profile.name).toBe('Bob');
    });

    it('should render multiple fields independently', () => {
        render(
            <>
                <FieldComponent fieldName="profile.name" />
                <FieldComponent fieldName="profile.age" />
            </>
        );
        
        const nameInput = screen.getByTestId('input-profile.name');
        const ageInput = screen.getByTestId('input-profile.age');

        expect((nameInput as HTMLInputElement).value).toBe('Alice');
        expect((ageInput as HTMLInputElement).value).toBe('25');

        act(() => {
            fireEvent.change(nameInput, { target: { value: 'Bob' } });
        });

        // Only name should change
        expect((nameInput as HTMLInputElement).value).toBe('Bob');
        expect((ageInput as HTMLInputElement).value).toBe('25');
        expect(screen.getByTestId('dirty-profile.name').textContent).toBe('true');
        expect(screen.getByTestId('dirty-profile.age').textContent).toBe('false');
    });
});
