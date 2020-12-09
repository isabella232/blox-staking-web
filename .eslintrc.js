module.exports = {
  "root": true,
  "extends": ['react-app'],
  "plugins": [
    "@typescript-eslint"
  ],
  "parserOptions": {
    "ecmaVersion": 7,
    "ecmaFeatures": {
      "modules": true,
      "jsx": true
    }
  },
  "rules": {
    "no-restricted-globals": 0,
    "react-hooks/exhaustive-deps": 0,
    "@typescript-eslint/no-redeclare": 0
  },
};