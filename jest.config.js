
export default {
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  "testPathIgnorePatterns": ["actors.js"],
  testEnvironment: "node",
  verbose: true,
  testTimeout: 3000,
};
