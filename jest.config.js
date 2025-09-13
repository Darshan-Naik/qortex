module.exports = {
  // Default configuration
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
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
  testTimeout: 15000,
  
  // Projects configuration for different packages
  projects: [
    {
      displayName: 'd-query-core',
      testEnvironment: 'node',
      roots: ['<rootDir>/packages/d-query'],
      testMatch: [
        '**/__tests__/**/*.test.js',
        '**/__tests__/**/*.test.ts',
        '**/?(*.)+(spec|test).js',
        '**/?(*.)+(spec|test).ts'
      ],
      collectCoverageFrom: [
        'packages/d-query/src/**/*.ts',
        '!packages/d-query/src/**/*.d.ts',
        '!packages/d-query/src/**/*.test.ts',
        '!packages/d-query/src/**/*.spec.ts'
      ],
      coverageDirectory: 'coverage/d-query',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(js|ts)$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'ts', 'json'],
      testTimeout: 15000,
    },
    {
      displayName: 'd-query-react',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/packages/d-query-react'],
      testMatch: [
        '**/__tests__/**/*.test.js',
        '**/__tests__/**/*.test.jsx',
        '**/?(*.)+(spec|test).js',
        '**/?(*.)+(spec|test).jsx'
      ],
      collectCoverageFrom: [
        'packages/d-query-react/src/**/*.{js,jsx,ts,tsx}',
        '!packages/d-query-react/src/**/*.d.ts',
        '!packages/d-query-react/src/**/*.test.{js,jsx,ts,tsx}',
        '!packages/d-query-react/src/**/*.spec.{js,jsx,ts,tsx}'
      ],
      coverageDirectory: 'coverage/d-query-react',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
      testTimeout: 15000,
      moduleNameMapping: {
        '^d-query$': '<rootDir>/packages/d-query/dist/index.js',
      },
    }
  ]
};
