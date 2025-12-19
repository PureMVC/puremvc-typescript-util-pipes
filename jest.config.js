module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/?(*.)+(spec|test).ts?(x)"],
  maxWorkers: 11,
  coverageDirectory: "coverage",
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
