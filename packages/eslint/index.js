const commonRules = {
  /**
   * Limiting the number of lines in a file contributes to better code
   * organization. An excessively large file may indicate that it has too
   * many responsibilities, and it would be beneficial to restructure its
   * logic across multiple modules.
   */
  'max-lines': ['error', 500],

  /**
   * Numerous abbreviations are already widely recognized among developers.
   * The responsibility for maintaining consistent naming extends beyond the
   * use of simple abbreviations.
   */
  'unicorn/prevent-abbreviations': 'off',

  /**
   * Prettier uses double quotes by default; however, the Airbnb style guide
   * recommends single quotes. For this reason, we have chosen to stick with
   * single quotes.
   * @see {@link https://github.com/airbnb/javascript#strings--quotes}
   * @see {@link https://prettier.io/docs/en/options.html#quotes}
   * @see {@link https://github.com/prettier/eslint-plugin-prettier#options}
   */
  'prettier/prettier': ['error', { singleQuote: true }],

  /**
   * Unused imports will be removed.
   */
  'unused-imports/no-unused-imports': 'error',
  'unused-imports/no-unused-vars': [
    'warn',
    {
      vars: 'all',
      varsIgnorePattern: '^_',
      args: 'after-used',
      argsIgnorePattern: '^_',
    },
  ],

  /**
   * Rules that impose limitations on syntax usage go beyond the purview of
   * ESLint. We hold the view that certain decisions should be made by
   * developers themselves, rather than constraining their choices. If any
   * of these rules are significant for your project, please enable them in
   * your project's settings.
   */
  'no-restricted-syntax': 'off',
  'unicorn/no-array-reduce': 'off',
  'no-param-reassign': 'off',
  'no-restricted-exports': 'off',
  'import/prefer-default-export': 'off',
};

const commonReactRules = {
  /**
   * The use of React.PropTypes is not recommended when working with TypeScript.
   */
  'react/require-default-props': 'off',

  /**
   * Establishes a consistent approach to declaring React components using
   * arrow functions, as class components are no longer recommended.
   */
  'react/function-component-definition': [
    'error',
    {
      namedComponents: 'arrow-function',
      unnamedComponents: 'function-expression',
    },
  ],

  /**
   * This rule has been disabled because, starting from version 17,
   * importing React is no longer mandatory.
   * @see {@link https://reactjs.org/blog/2020/10/20/react-v17.html#new-jsx-transform}
   */
  'react/react-in-jsx-scope': 'off',

  /**
   * This configuration allows for a simpler way of changing a static string
   * to a dynamic parameter by using braces instead of quotes. Instead of
   * manually changing the quotes to braces when modifying a value, simply
   * wrapping it in braces allows for easier and more efficient updates.
   */
  'react/jsx-curly-brace-presence': [
    'error',
    { props: 'always', children: 'never' },
  ],

  /**
   * When a boolean property is set to true, it is more practical to keep
   * the property name without the value. However, omitting the value can
   * cause readability and maintenance issues for the component.
   */
  'react/jsx-boolean-value': ['error', 'always'],

  /**
   * With JavaScript, using the spread operator can create uncertainty
   * regarding the contents of props, making it difficult to maintain
   * readability. However, with TypeScript's strong typing system, this
   * concern is reduced as the type of the variable is known, making it
   * easier to ensure code clarity and maintainability.
   * @see {@link https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-props-no-spreading.md}
   * @see {@link https://www.typescriptlang.org/docs/handbook/interfaces.html}
   */
  'react/jsx-props-no-spreading': 'off',

  /**
   * Specifying all dependencies is not always required, and at times, this
   * rule may cause more problems than it solves.
   */
  'react-hooks/exhaustive-deps': 'off',
};

module.exports = {
  //----------------------------------------------------------------------------
  // Node
  //----------------------------------------------------------------------------

  env: {
    node: true,
    jest: true,
  },

  extends: [
    /**
     * @see {@link https://www.npmjs.com/package/eslint-config-airbnb-base}
     */
    'airbnb-base',

    /**
     * @see {@link https://github.com/sindresorhus/eslint-plugin-unicorn}
     */
    'plugin:unicorn/recommended',

    /**
     * @see {@link https://github.com/prettier/eslint-plugin-prettier}
     */
    'plugin:prettier/recommended',
  ],

  rules: {
    /**
     * Adopting JavaScript modules (ESM) is not applicable for general
     * configuration files.
     */
    'unicorn/prefer-module': 'off',

    //--------------------------------------------------------------------------

    ...commonRules,
  },

  //----------------------------------------------------------------------------
  // TypeScript
  //----------------------------------------------------------------------------

  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],

      env: {
        browser: true,
        es2022: true,
        jest: true,
        node: true,
      },

      parser: '@typescript-eslint/parser',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },

      extends: [
        //----------------------------------------------------------------------
        // JavaScript and React
        //----------------------------------------------------------------------

        /**
         * @see {@link https://www.npmjs.com/package/eslint-config-airbnb}
         */
        'airbnb',
        'airbnb/hooks',

        /**
         * @see {@link https://github.com/sindresorhus/eslint-plugin-unicorn#recommended-config}
         */
        'plugin:unicorn/recommended',

        //----------------------------------------------------------------------
        // Testing
        //----------------------------------------------------------------------

        /**
         * @see {@link https://www.npmjs.com/package/eslint-plugin-jest-dom}
         */
        'plugin:jest-dom/recommended',

        //----------------------------------------------------------------------
        // TypeScript
        //----------------------------------------------------------------------
        /**
         * @see {@link https://typescript-eslint.io/getting-started}
         */
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',

        // Prettier
        'plugin:prettier/recommended',
      ],

      plugins: ['unused-imports'],

      rules: {
        //----------------------------------------------------------------------
        // CONFLICTS
        //----------------------------------------------------------------------

        /**
         * This rule is disabled due to the "unicorn/prefer-regexp-test" rule
         * that deals with the same issue. Since this is not an exclusive rule
         * in the context of TypeScript, but of EcmaScript, we gave preference
         * to Unicorn
         * @see {@link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-regexp-test.md}
         * @see {@link https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/prefer-regexp-exec.md}
         */
        '@typescript-eslint/prefer-regexp-exec': 'off',

        /**
         * TypeScript handles this natively
         */
        'no-use-before-define': 'off',

        // /**
        //  * Some typings don't handle this rule well.
        //  */
        // 'unicorn/no-useless-undefined': 'off',

        /**
         * This rule was originally created to guarantee the use of components
         * in JSX files, but because we adopt TypeScript as a standard this rule
         * needs to be adjusted for TSX
         * @see {@link https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-filename-extension.md}
         * @see {@link https://www.typescriptlang.org/docs/handbook/jsx.html}
         */
        'react/jsx-filename-extension': [
          'error',
          {
            extensions: ['.tsx'],
          },
        ],
        'import/extensions': [
          'error',
          {
            extensions: ['.ts', '.tsx'],
          },
        ],

        /**
         * Disabled due to the type inference in Typescript
         */
        'consistent-return': 'off',

        /**
         * The idea here is to maintain the kebab case as standard as
         * recommended by Unicorn, except for React components, which require
         * pascal case.
         * @see {@link https://github.com/airbnb/javascript/tree/master/react#naming }
         * @see {@link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/filename-case.md}
         * @see {@link https://stackoverflow.com/questions/2103596/regex-that-matches-camel-and-pascal-case}
         */
        'unicorn/filename-case': [
          'error',
          {
            cases: {
              kebabCase: true,
            },
            ignore: [
              // React components, test, styles, etc
              '^(?:[A-Z][a-z]+)+(\\.[a-z]+)?\\.ts(x)?$',

              // React Hooks
              '^(use)(?:[A-Z][a-z]+)+\\.ts?$',

              // Typescript config
              'setupTests.ts',

              // Create React App
              'reportWebVitals.ts',
            ],
          },
        ],

        // /**
        //  * These PropTypes related rules are disabled in favor of using TypeScript
        //  * @see {@link https://reactjs.org/docs/static-type-checking.html}
        //  * @see {@link https://reactjs.org/docs/typechecking-with-proptypes.html#gatsby-focus-wrapper}
        //  * @see {@link https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prop-types.md}
        //  */
        // 'react/prop-types': 'off',
        // 'react/require-default-props': 'off',

        /**
         * We enabled all TypeScript rules, but there are rules that encourage
         * or not the use of Non-null assertion operator, we chose to disable
         * the only rule that discourages
         */
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',

        //----------------------------------------------------------------------
        // Jest
        //----------------------------------------------------------------------

        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: ['**/*.test.tsx', '**/setupTests.ts'],
          },
        ],

        //----------------------------------------------------------------------
        // TypeScript
        //----------------------------------------------------------------------

        /**
         * Allow certain optimizations within compilers
         * @see {https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export}
         * @see {https://www.typescriptlang.org/tsconfig#isolatedModules}
         */
        '@typescript-eslint/consistent-type-imports': 'error',

        /**
         * It is good practice not to use ts-ignore, but when used it is usually
         * really necessary, and when the project is "strict: true" we
         * understand that there is already an extra care in typing which would
         * make the use of "ts-ignore" rare, since in cases of "strict: false"
         * we can understand that the project does not have a very strong
         * typing, which would also weaken the use of this rule. And for these
         * reasons we decided to disable this rule.
         */
        '@typescript-eslint/ban-ts-comment': 'off',

        /**
         * I like it :)
         */
        '@typescript-eslint/explicit-function-return-type': 'error',

        // /**
        //  * This rule is disabled because of the "no-param-reassign" rule that
        //  * deals with the same issue.
        //  */
        // '@typescript-eslint/prefer-readonly-parameter-types': 'off',

        // '@typescript-eslint/no-type-alias': 'off',
        // '@typescript-eslint/strict-boolean-expressions': 'off',
        // '@typescript-eslint/init-declarations': 'off',

        // '@typescript-eslint/no-var-requires': 'off',
        // 'unicorn/no-useless-undefined': 'off',

        //----------------------------------------------------------------------
        // RECOMMENDATIONS
        //----------------------------------------------------------------------

        ...commonRules,

        //----------------------------------------------------------------------
        // UNUSED IMPORTS
        //----------------------------------------------------------------------

        /**
         * Unused imports will be removed.
         */
        '@typescript-eslint/no-unused-vars': 'off',

        //----------------------------------------------------------------------

        // /**
        //  * Limiting the number of lines helps to organize the code, a very large
        //  * file may have too much responsibility being necessary to reorganize
        //  * its logic in more modules
        //  */
        // 'max-lines': ['error', 500],
        //
        // /**
        //  * Some rules that in my humble opinion go beyond the domain of ESLint
        //  */
        // 'no-restricted-syntax': 'off',
        // '@typescript-eslint/ban-ts-comment': 'off',
        // 'import/prefer-default-export': 'off',
        // 'no-plusplus': 'off',
      },
    },
    //--------------------------------------------------------------------------
    // React
    //--------------------------------------------------------------------------
    {
      files: ['**/*.tsx'],
      rules: commonReactRules,
    },
  ],
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
