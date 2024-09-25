
export default {
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testEnvironment: "node",
  verbose: true,
  testTimeout: 3000,
};