/* eslint-disable unicorn/prefer-module */
module.exports = {
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
    //--------------------------------------------------------------------------
    // CONFLICTS
    //--------------------------------------------------------------------------

    /**
     * Prettier follows double quotes by default, but the Airbnb style guide
     * recommends single quotes
     * @see {@link https://github.com/airbnb/javascript#strings--quotes}
     * @see {@link https://prettier.io/docs/en/options.html#quotes}
     * @see {@link https://github.com/prettier/eslint-plugin-prettier#options}
     */
    'prettier/prettier': ['error', { singleQuote: true }],

    // /**
    //  * Allow Function Expression
    //  * @see {@link https://javascript.info/function-expressions}
    //  * @see {@link https://www.typescriptlang.org/docs/handbook/functions.html#functions}
    //  */
    // 'func-names': ['error', 'as-needed'],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      env: {
        browser: true,
        es2020: true,
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
        // EcmaScript and React
        'airbnb',
        'airbnb/hooks',
        'plugin:unicorn/recommended',

        // Test
        'plugin:jest-dom/recommended',

        // TypeScript
        'plugin:@typescript-eslint/all',
        'plugin:import/typescript',

        // Prettier
        'plugin:prettier/recommended',
      ],

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
         * this rule is disabled because of the type inference in Typescript
         */
        'consistent-return': 'off',

        /**
         * The idea here is to keep the kebab case as standard as recommended by
         * Unicorn, except for React components that need to be pascal case
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
              '^(?:[A-Z][a-z]+)+.tsx$',
              'setupTests.ts',
              'reportWebVitals.ts',
            ],
          },
        ],

        /**
         * Keep the rule to prevent abbreviations, but with the exception of
         * "props" because of React
         * @see {@link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prevent-abbreviations.md#whitelist}
         * @see {@link https://reactjs.org/docs/render-props.html}
         */
        'unicorn/prevent-abbreviations': [
          'error',
          {
            allowList: {
              props: true,
              Props: true,
            },
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
         * We enabled all TypeScript rules, but there are rules that encourage or not the use of Non-null assertion
         * operator, we chose to disable the only rule that discourages
         */
        '@typescript-eslint/no-non-null-assertion': 'off',

        //----------------------------------------------------------------------
        // React
        //----------------------------------------------------------------------

        // /**
        //  * In the EcmaScript context this rule makes a lot of sense, since you
        //  * are not sure what exists in props, however with TypeScript this is
        //  * different, you know exactly the type of that props helping the code
        //  * readability
        //  * @see {@link https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-props-no-spreading.md}
        //  * @see {@link https://www.typescriptlang.org/docs/handbook/interfaces.html}
        //  */
        // 'react/jsx-props-no-spreading': 'off',

        /**
         * With version 17 of React, importing it is optional
         * @see {@link https://reactjs.org/blog/2020/10/20/react-v17.html#new-jsx-transform}
         */
        'react/react-in-jsx-scope': 'off',

        // /**
        //  * this rule never worked well for me, it ends up more disturbing than
        //  * helping, so it is disabled.
        //  */
        // 'react-hooks/exhaustive-deps': 'off',

        //----------------------------------------------------------------------

        // 'import/no-extraneous-dependencies': [
        //   'error',
        //   {
        //     devDependencies: ['**/*.test.tsx', '**/setupTests.ts'],
        //   },
        // ],

        // '@typescript-eslint/no-var-requires': 'off',
        // 'unicorn/no-useless-undefined': 'off',

        //----------------------------------------------------------------------
        // RECOMMENDATIONS
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
    {
      files: ['**/*.tsx'],
      rules: {
        '@typescript-eslint/naming-convention': 'off',
        'react/function-component-definition': [
          'error',
          {
            namedComponents: 'arrow-function',
            unnamedComponents: 'function-expression',
          },
        ],
      },
    },
  ],
};
