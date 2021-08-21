module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    "jest/globals": true
  },
  extends: [
    "eslint:recommended",
  ],
  rules: {
    quotes: ["error", "double"],
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  plugins: ["jest"],
};
