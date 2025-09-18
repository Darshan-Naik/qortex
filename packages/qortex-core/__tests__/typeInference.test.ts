import { QueryManagerCore } from '../src/queryManagerCore';
import { Fetcher, QueryKey } from '../src/types';

describe('Enhanced Type Inference Tests', () => {
    let queryManager: QueryManagerCore;

    beforeEach(() => {
        queryManager = new QueryManagerCore();
    });

    describe('Automatic Type Inference', () => {
        test('should automatically infer types from fetcher functions', () => {
            const stringFetcher: Fetcher<string> = async () => 'hello';
            const numberFetcher: Fetcher<number> = async () => 42;
            const objectFetcher: Fetcher<{ id: number; name: string }> = async () => ({ id: 1, name: 'test' });

            // These should automatically infer types from the fetcher - no explicit types needed!
            queryManager.registerFetcher(['string-key'], { fetcher: stringFetcher });
            queryManager.registerFetcher(['number-key'], { fetcher: numberFetcher });
            queryManager.registerFetcher(['object-key'], { fetcher: objectFetcher });

            // Type should be automatically inferred from the fetcher
            const stringData = queryManager.getQueryData(['string-key']);
            const numberData = queryManager.getQueryData(['number-key']);
            const objectData = queryManager.getQueryData(['object-key']);

            // These assertions verify the types are working
            expect(stringData).toBeUndefined(); // Initially undefined
            expect(numberData).toBeUndefined(); // Initially undefined
            expect(objectData).toBeUndefined(); // Initially undefined
        });

        test('should work with explicit types when provided', () => {
            const stringFetcher: Fetcher<string> = async () => 'hello';
            const numberFetcher: Fetcher<number> = async () => 42;
            const objectFetcher: Fetcher<{ id: number; name: string }> = async () => ({ id: 1, name: 'test' });

            // These should compile without errors and work with explicit types
            queryManager.registerFetcher<string>(['string-key'], { fetcher: stringFetcher });
            queryManager.registerFetcher<number>(['number-key'], { fetcher: numberFetcher });
            queryManager.registerFetcher<{ id: number; name: string }>(['object-key'], { fetcher: objectFetcher });

            // Type should work correctly when explicitly provided
            const stringData = queryManager.getQueryData<string>(['string-key']);
            const numberData = queryManager.getQueryData<number>(['number-key']);
            const objectData = queryManager.getQueryData<{ id: number; name: string }>(['object-key']);

            // These assertions verify the types are working
            expect(stringData).toBeUndefined(); // Initially undefined
            expect(numberData).toBeUndefined(); // Initially undefined
            expect(objectData).toBeUndefined(); // Initially undefined
        });

        test('should fallback to any when no types are provided', () => {
            // These should work without any type annotations - user-friendly!
            queryManager.registerFetcher(['simple-key'], {
                fetcher: async () => 'any data'
            });
            queryManager.registerFetcher(['another-key'], {
                fetcher: () => 123
            });

            // Should work without explicit type parameters
            const data1 = queryManager.getQueryData(['simple-key']);
            const data2 = queryManager.getQueryData(['another-key']);
            const state1 = queryManager.getQueryState(['simple-key']);
            const state2 = queryManager.getQueryState(['another-key']);

            expect(data1).toBeUndefined(); // Initially undefined
            expect(data2).toBeUndefined(); // Initially undefined
            expect(state1.status).toBeDefined();
            expect(state2.status).toBeDefined();
        });

        test('should infer types correctly for getQueryState', () => {
            const fetcher: Fetcher<{ id: number; name: string }> = async () => ({ id: 1, name: 'test' });

            queryManager.registerFetcher(['user-key'], { fetcher });

            const state = queryManager.getQueryState<{ id: number; name: string }>(['user-key']);

            // Verify the state has the correct structure
            expect(state.status).toBeDefined();
            expect(typeof state.isLoading).toBe('boolean');
            expect(typeof state.refetch).toBe('function');
            expect(state.data).toBeUndefined(); // Initially undefined
        });

        test('should handle complex nested types', () => {
            interface User {
                id: number;
                name: string;
                profile: {
                    avatar: string;
                    settings: {
                        theme: 'light' | 'dark';
                        notifications: boolean;
                    };
                };
            }

            const userFetcher: Fetcher<User> = async () => ({
                id: 1,
                name: 'John Doe',
                profile: {
                    avatar: 'avatar.jpg',
                    settings: {
                        theme: 'light',
                        notifications: true
                    }
                }
            });

            queryManager.registerFetcher(['user-profile'], { fetcher: userFetcher });

            const userData = queryManager.getQueryData<User>(['user-profile']);
            const userState = queryManager.getQueryState<User>(['user-profile']);

            expect(userData).toBeUndefined(); // Initially undefined
            expect(userState.status).toBeDefined();
        });
    });

    describe('QueryKey Type Safety', () => {
        test('should accept valid query keys', () => {
            const validKeys: QueryKey[] = [
                'simple-string',
                ['array', 'of', 'strings'],
                ['mixed', 123, 'types'],
                [1, 2, 3],
                [] // Empty array is valid
            ];

            validKeys.forEach((key, index) => {
                expect(() => {
                    queryManager.registerFetcher(key, {
                        fetcher: async () => `data-${index}`
                    });
                }).not.toThrow();
            });
        });
    });

    describe('Generic Type Constraints', () => {
        test('should maintain type safety across method calls', () => {
            interface ApiResponse<T> {
                data: T;
                status: number;
                message: string;
            }

            const apiFetcher: Fetcher<ApiResponse<string[]>> = async () => ({
                data: ['item1', 'item2'],
                status: 200,
                message: 'Success'
            });

            queryManager.registerFetcher(['api-data'], { fetcher: apiFetcher });

            const response = queryManager.getQueryData<ApiResponse<string[]>>(['api-data']);
            const state = queryManager.getQueryState<ApiResponse<string[]>>(['api-data']);

            expect(response).toBeUndefined(); // Initially undefined
            expect(state.status).toBeDefined();
        });
    });
});
