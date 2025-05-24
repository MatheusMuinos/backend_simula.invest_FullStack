// jest.config.cjs
module.exports = {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^@models/(.*)$': '/workspaces/backend_simula.invest_FullStack/src/models/$1',
    '^@services/(.*)$': '/workspaces/backend_simula.invest_FullStack/src/services/$1',
    '^@controller/(.*)$': '/workspaces/backend_simula.invest_FullStack/src/controller/$1'
  },
  globals: {
    'jest': true
  },
  setupFilesAfterEnv: ['/workspaces/backend_simula.invest_FullStack/src/testes/setup.js'],
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
    '!src/config/**'
  ]
};