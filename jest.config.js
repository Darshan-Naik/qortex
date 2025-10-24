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
      displayName: 'qortex-core',
      testEnvironment: 'node',
      roots: ['<rootDir>/packages/qortex-core'],
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
        'packages/qortex-core/src/**/*.ts',
        '!packages/qortex-core/src/**/*.d.ts',
        '!packages/qortex-core/src/**/*.test.ts',
        '!packages/qortex-core/src/**/*.spec.ts'
      ],
      coverageDirectory: 'coverage/qortex-core',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(js|ts)$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'ts', 'json'],
    },
    {
      displayName: 'qortex-react',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/packages/qortex-react'],
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
        'packages/qortex-react/src/**/*.{js,jsx,ts,tsx}',
        '!packages/qortex-react/src/**/*.d.ts',
        '!packages/qortex-react/src/**/*.test.{js,jsx,ts,tsx}',
        '!packages/qortex-react/src/**/*.spec.{js,jsx,ts,tsx}'
      ],
      coverageDirectory: 'coverage/qortex-react',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
      moduleNameMapper: {
        '^qortex-core$': '<rootDir>/packages/qortex-core/dist/index.js',
      },
    },
    {
      displayName: 'qortex-react-legacy',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/packages/qortex-react-legacy'],
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
        'packages/qortex-react-legacy/src/**/*.{js,jsx,ts,tsx}',
        '!packages/qortex-react-legacy/src/**/*.d.ts',
        '!packages/qortex-react-legacy/src/**/*.test.{js,jsx,ts,tsx}',
        '!packages/qortex-react-legacy/src/**/*.spec.{js,jsx,ts,tsx}'
      ],
      coverageDirectory: 'coverage/qortex-react-legacy',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
      moduleNameMapper: {
        '^qortex-core$': '<rootDir>/packages/qortex-core/dist/index.js',
      },
    }
  ]
};
