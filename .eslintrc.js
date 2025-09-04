module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended", "plugin:node/recommended"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["prettier", "node"],
  rules: {
    // Prettier rules
    "prettier/prettier": [
      "error",
      {
        "printWidth": 100,
        "tabWidth": 2,
        "useTabs": false,
        "semi": true,
        "singleQuote": true,
        "quoteProps": "as-needed",
        "jsxSingleQuote": false,
        "trailingComma": "es5",
        "bracketSpacing": true,
        "bracketSameLine": false,
        "arrowParens": "avoid",
        "proseWrap": "preserve",
        "htmlWhitespaceSensitivity": "css",
        "endOfLine": "auto",
        "embeddedLanguageFormatting": "auto",
        "singleAttributePerLine": false,
        "requirePragma": false,
        "insertPragma": false,
        "vueIndentScriptAndStyle": false,
        "rangeStart": 0,
        "rangeEnd": Infinity,
        "parser": "babel",
        "filepath": "",
        "plugins": [],
        // Additional configurations commonly used by senior developers
        "importOrder": ["^@core/(.*)$", "^@server/(.*)$", "^@ui/(.*)$", "^[./]"],
        "importOrderSeparation": true,
        "importOrderSortSpecifiers": true,
        "overrides": [
          {
            "files": "*.json",
            "options": {
              "printWidth": 200
            }
          },
          {
            "files": "*.yml",
            "options": {
              "singleQuote": false
            }
          },
          {
            "files": ["*.ts", "*.tsx"],
            "options": {
              "parser": "typescript"
            }
          }
        ]
      }
    ],

    // Node.js specific rules
    "node/no-unsupported-features/es-syntax": ["error", { ignores: ["modules"] }],
    "node/no-missing-require": "error",
    "node/no-unpublished-require": "off",
    "node/no-unpublished-import": "off",

    // General rules
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-prototype-builtins": "warn",
    "no-var": "error",
    "prefer-const": "error",
    eqeqeq: ["error", "always"],
    curly: ["error", "all"],
    quotes: ["error", "single", { avoidEscape: true }],
    semi: ["error", "always"],
    "comma-dangle": ["error", "never"],
    "max-len": ["error", { code: 100, ignoreComments: true, ignoreUrls: true }],
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "never"],
    "arrow-spacing": ["error", { before: true, after: true }],
    "block-spacing": ["error", "always"],
    "comma-spacing": ["error", { before: false, after: true }],
    "func-call-spacing": ["error", "never"],
    "key-spacing": ["error", { beforeColon: false, afterColon: true }],
    "keyword-spacing": ["error", { before: true, after: true }],
    "space-before-blocks": ["error", "always"],
    "space-before-function-paren": ["error", "never"],
    "space-in-parens": ["error", "never"],
    "space-infix-ops": "error",
    "space-unary-ops": ["error", { words: true, nonwords: false }],
    "spaced-comment": ["error", "always"],
    "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
    "padded-blocks": ["error", "never"],
    "no-trailing-spaces": "error",
    "no-whitespace-before-property": "error",
    "no-multi-spaces": "error",
    "no-mixed-spaces-and-tabs": "error",
    indent: ["error", 2, { SwitchCase: 1 }],
    "linebreak-style": ["error", "unix"],
    "eol-last": ["error", "always"],
  },
  settings: {
    node: {
      tryExtensions: [".js", ".json", ".node"],
    },
  },
};
