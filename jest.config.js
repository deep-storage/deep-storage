// jest.config.js
module.exports = {
    rootDir: 'src',
    moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
    transform: {
        '^.+\\.(ts|tsx)$': '<rootDir>/../preprocessor.js'
    },
    testMatch: ['**/__tests__/*.(ts|tsx|js)']
};