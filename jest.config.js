module.exports = {
  // Default configuration
  testEnvironment: 'node',
  testTimeout: 15000,
  roots: ['<rootDir>/packages'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.test.jsx',
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).js',
    '**/?(*.)+(spec|test).jsx',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'packages/*/src/**/*.{js,jsx,ts,tsx}',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/**/*.test.{js,jsx,ts,tsx}',
    '!packages/*/src/**/*.spec.{js,jsx,ts,tsx}'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  // Projects configuration for different packages
  projects: [
    {
      displayName: 'qortex-query',
      testEnvironment: 'node',
      roots: ['<rootDir>/packages/query'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/',
        '/coverage/'
      ],
      testMatch: [
        '**/__tests__/**/*.test.js',
        '**/__tests__/**/*.test.ts',
        '**/?(*.)+(spec|test).js',
        '**/?(*.)+(spec|test).ts'
      ],
      collectCoverageFrom: [
        'packages/query/src/**/*.ts',
        '!packages/query/src/**/*.d.ts',
        '!packages/query/src/**/*.test.ts',
        '!packages/query/src/**/*.spec.ts'
      ],
      coverageDirectory: 'coverage/query',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(js|ts)$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'ts', 'json'],
    },
    {
      displayName: 'qortex-query-react',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/packages/query-react'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/',
        '/coverage/'
      ],
      testMatch: [
        '**/__tests__/**/*.test.js',
        '**/__tests__/**/*.test.jsx',
        '**/?(*.)+(spec|test).js',
        '**/?(*.)+(spec|test).jsx'
      ],
      collectCoverageFrom: [
        'packages/query-react/src/**/*.{js,jsx,ts,tsx}',
        '!packages/query-react/src/**/*.d.ts',
        '!packages/query-react/src/**/*.test.{js,jsx,ts,tsx}',
        '!packages/query-react/src/**/*.spec.{js,jsx,ts,tsx}'
      ],
      coverageDirectory: 'coverage/query-react',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
      moduleNameMapper: {
        '^qortex-query$': '<rootDir>/packages/query/dist/index.js',
      },
    },
    {
      displayName: 'qortex-db',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/packages/db'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/',
        '/coverage/'
      ],
      testMatch: [
        '**/__tests__/**/*.test.js',
        '**/__tests__/**/*.test.ts',
        '**/?(*.)+(spec|test).js',
        '**/?(*.)+(spec|test).ts'
      ],
      collectCoverageFrom: [
        'packages/db/src/**/*.ts',
        '!packages/db/src/**/*.d.ts',
        '!packages/db/src/**/*.test.ts',
        '!packages/db/src/**/*.spec.ts'
      ],
      coverageDirectory: 'coverage/db',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(js|ts)$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'ts', 'json'],
      moduleNameMapper: {
        '^qortex-db/query$': '<rootDir>/packages/db/src/query.ts',
        '^qortex-db/store$': '<rootDir>/packages/db/src/store.ts',
      },
    },
    {
      displayName: 'qortex-store',
      testEnvironment: 'node',
      roots: ['<rootDir>/packages/store'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/',
        '/coverage/'
      ],
      testMatch: [
        '**/__tests__/**/*.test.js',
        '**/__tests__/**/*.test.ts',
        '**/?(*.)+(spec|test).js',
        '**/?(*.)+(spec|test).ts'
      ],
      collectCoverageFrom: [
        'packages/store/src/**/*.ts',
        '!packages/store/src/**/*.d.ts',
        '!packages/store/src/**/*.test.ts',
        '!packages/store/src/**/*.spec.ts'
      ],
      coverageDirectory: 'coverage/store',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(js|ts)$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'ts', 'json'],
    },
    {
      displayName: 'qortex-store-react',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/packages/store-react'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/',
        '/coverage/'
      ],
      testMatch: [
        '**/__tests__/**/*.test.js',
        '**/__tests__/**/*.test.jsx',
        '**/?(*.)+(spec|test).js',
        '**/?(*.)+(spec|test).jsx'
      ],
      collectCoverageFrom: [
        'packages/store-react/src/**/*.{js,jsx,ts,tsx}',
        '!packages/store-react/src/**/*.d.ts',
        '!packages/store-react/src/**/*.test.{js,jsx,ts,tsx}',
        '!packages/store-react/src/**/*.spec.{js,jsx,ts,tsx}'
      ],
      coverageDirectory: 'coverage/store-react',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
      moduleNameMapper: {
        '^qortex-store$': '<rootDir>/packages/store/src/index.ts',
      },
    },
    {
      displayName: 'qortex-form',
      testEnvironment: 'node',
      roots: ['<rootDir>/packages/form'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/',
        '/coverage/'
      ],
      testMatch: [
        '**/__tests__/**/*.test.js',
        '**/__tests__/**/*.test.ts',
        '**/?(*.)+(spec|test).js',
        '**/?(*.)+(spec|test).ts'
      ],
      collectCoverageFrom: [
        'packages/form/src/**/*.ts',
        '!packages/form/src/**/*.d.ts',
        '!packages/form/src/**/*.test.ts',
        '!packages/form/src/**/*.spec.ts'
      ],
      coverageDirectory: 'coverage/form',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(js|ts)$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'ts', 'json'],
    },
    {
      displayName: 'qortex-form-react',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/packages/form-react'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/',
        '/coverage/'
      ],
      testMatch: [
        '**/__tests__/**/*.test.js',
        '**/__tests__/**/*.test.jsx',
        '**/__tests__/**/*.test.tsx',
        '**/?(*.)+(spec|test).js',
        '**/?(*.)+(spec|test).jsx',
        '**/?(*.)+(spec|test).tsx'
      ],
      collectCoverageFrom: [
        'packages/form-react/src/**/*.{js,jsx,ts,tsx}',
        '!packages/form-react/src/**/*.d.ts',
        '!packages/form-react/src/**/*.test.{js,jsx,ts,tsx}',
        '!packages/form-react/src/**/*.spec.{js,jsx,ts,tsx}'
      ],
      coverageDirectory: 'coverage/form-react',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
      moduleNameMapper: {
        '^qortex-form$': '<rootDir>/packages/form/src/index.ts',
        '^qortex-form-react/query$': '<rootDir>/packages/form-react/src/query.ts',
        '^qortex-form-react/store$': '<rootDir>/packages/form-react/src/store.ts',
        '^qortex-query-react$': '<rootDir>/packages/query-react/src/index.ts',
        '^qortex-query$': '<rootDir>/packages/query/src/index.ts',
        '^qortex-store$': '<rootDir>/packages/store/src/index.ts',
      },
    }
  ]
};
