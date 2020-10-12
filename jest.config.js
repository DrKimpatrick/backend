module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(spec))\\.(ts?)$',
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverage: true,
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.json',
    },
  },
  moduleDirectories: ['node_modules', 'src'],
  setupFilesAfterEnv: [
    '<rootDir>/src/initSpec.ts',
  ],
};
