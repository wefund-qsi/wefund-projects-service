module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.(spec|integration-spec)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};
