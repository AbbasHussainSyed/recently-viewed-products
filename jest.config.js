module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    resetMocks: true,
    clearMocks: true,
    restoreMocks: true,
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/app.js',
        '!src/config/*.js'
    ],
    testMatch: ['**/src/tests/**/*.test.js'],
    verbose: true,
    moduleDirectories: ['node_modules', 'src']
};