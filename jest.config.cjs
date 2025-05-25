module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@controller/(.*)$': '<rootDir>/src/controller/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1'
  },
  globals: {
    'jest': true
  },
  setupFilesAfterEnv: ['<rootDir>/src/testes/setup.js'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/models/**',
    '!src/routes/**',
    '!src/config/**',
    '!src/testes/setup.js',
    '!src/index.js'
  ]
};