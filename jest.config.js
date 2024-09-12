
export default {
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testPathIgnorePatterns: ["actors.js"],
  modulePathIgnorePatterns: ["temp"],
  testEnvironment: "node",
  verbose: true,
  testTimeout: 3000,
};
