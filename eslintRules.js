// rules for eslint style-checker

// Rules to guard against possible mistakes
const possibleErrorRules = {
    // Disallow unused variables/imports
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
        "vars": "all",
        "args": "none", // don't check function args
        "ignoreRestSiblings": false, // don't check rests like { a, ...b }
    }],

    // Disallow using variables/functions/classes/enums/types before they're
    // defined
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": "error",

    // Enforce annotating function types and return types
    "@typescript-eslint/explicit-function-return-type": ["error", {
        // Allow no return type on function expressions
        "allowExpressions": true,
        // Allow function type to go on variable
        "allowTypedFunctionExpressions": true,
        // Functions immediately returning a function type will be ignored
        "allowHigherOrderFunctions": true,
    }],

    // Enforce that in `foo + bar`, the variables are either both numbers or
    // both strings
    "@typescript-eslint/restrict-plus-operands": "error",

    // Prefer `x` and `!x` over `x === true` and `x === false`
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",

    // Disallow truthy checks on variables that must be truthy based on their
    // type
    "@typescript-eslint/no-unnecessary-condition": ["error", {
        "allowConstantLoopConditions": true,
    }],

    // Prefer things like `x || y` over `x ? x : y` or `!x` over `x ? false : true`
    "no-unneeded-ternary": ["error", {
        "defaultAssignment": false,
    }],

    "@typescript-eslint/prefer-nullish-coalescing": ["error"],

    // Disallow calling methods without the original class scope
    "@typescript-eslint/unbound-method": ["error", {
        "ignoreStatic": true,
    }],

    // Prefer arrow lambdas over aliasing `this`
    "@typescript-eslint/no-this-alias": "error",

    // Prefer `const`
    "prefer-const": ["warn", {
        "destructuring": "all",
    }],

    // Don't use `var`
    "no-var": "error",

    // Disallow fallthrough in switches
    "no-fallthrough": "error",

    // Prefer `for..of` loops when index is not being used
    "@typescript-eslint/prefer-for-of": "warn",

    // Disallow `for..in` loops when iterating over arrays
    "@typescript-eslint/no-for-in-array": "error",

    // Disallow explicit Array constructor calls without a type parameter
    "@typescript-eslint/no-array-constructor": "error",

    // Disallow `interface Foo {}`
    "@typescript-eslint/no-empty-interface": ["error", {
        "allowSingleExtends": true,
    }],

    // Enforce proper new/constructor usage
    "@typescript-eslint/no-misused-new": "error",

    // Discourage using classes as namespaces
    "@typescript-eslint/no-extraneous-class": "error",

    // Disallow silent duplicate class members
    "no-dupe-class-members": "off",
    "@typescript-eslint/no-dupe-class-members": "error",

    // Prefer `() => Foo` over `interface Foo { (): Bar; }`
    "@typescript-eslint/prefer-function-type": "error",

    // Disallow extra non-null assertions
    "@typescript-eslint/no-extra-non-null-assertion": "warn",

    // Disallow type assertion that does not change the type of an expression
    "@typescript-eslint/no-unnecessary-type-assertion": "warn",

    // Enforce proper handling of Promises
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",

    // Enforce functions returning Promises to be marked async
    "@typescript-eslint/promise-function-async": "error",

    // Ensure that switches on union types are exhaustive
    "@typescript-eslint/switch-exhaustiveness-check": "error",

    // Enforce that optional or default parameters come last
    "@typescript-eslint/default-param-last": "error",

    // Disallow comparing to NaN, prefer `Number.isNaN()`
    "use-isnan": "error",
};

// Rules that enforce consistent code style
const styleRules = {

    // Limit line length
    "max-len": ["Warn", 120],

    // Indent with 4 spaces
    "indent": "off",
    "@typescript-eslint/indent": ["warn", 2, {
        "ignoredNodes": ["TemplateLiteral > *", "ClassProperty > *"],
    }],

    // Disallow trailing whitespace
    "no-trailing-spaces": "warn",

    // Prefer the one true brace style
    "brace-style": "off",
    "@typescript-eslint/brace-style": ["warn", "1tbs", {
        "allowSingleLine": true,
    }],

    // Prefer `if (...) { ... } over if (...) ...`
    "curly": "warn",

    // Prefer using `===` over `==`
    "eqeqeq": "warn",

    // Prefer `{ ... }` over `{...}`
    "object-curly-spacing": ["warn", "always"],

    // Prefer `{ ... }` over `{...}` for blocks
    "block-spacing": ["warn", "always"],

    // Prefer `[...]` over `[ ... ]`
    "array-bracket-spacing": ["warn", "never"],

    // Always prefer a semicolon
    "semi": "off",
    "@typescript-eslint/semi": ["warn", "always"],

    // Disallow redundant semicolons
    "no-extra-semi": "off",
    "@typescript-eslint/no-extra-semi": "warn",

    // Disallow space before semicolon
    "semi-spacing": "warn",

    // Enforce consistent spacing around commas
    "comma-spacing": "off",
    "@typescript-eslint/comma-spacing": "warn",

    // Prefer commas on the end of lines
    "comma-style": "warn",

    // Disallow unnecessary spaces
    "no-multi-spaces": "warn",

    // Prefer `foo + bar` over `foo+bar`
    "space-infix-ops": "warn",

    // Allow both single and double quote strings
    "quotes": "off",

    // Prefer `// foo` over `//foo`
    "spaced-comment": ["warn", "always", {
        "line": {
            "markers": ["/"],
        },
        "block": {
            "balanced": true,
        },
    }],

    // Prefer `function foo() { ... }` over `function foo () { ... }`
    // Prefer `function() { ... }` over `function () { ... }`
    "space-before-function-paren": "off",
    "@typescript-eslint/space-before-function-paren": ["warn", {
        "anonymous": "never",
        "named": "never",
        "asyncArrow": "always"
    }],

    // Prefer "if (" over "if("
    "keyword-spacing": "warn",

    // Prefer `foo(args)` over `foo (args)`
    "func-call-spacing": "off",
    "@typescript-eslint/func-call-spacing": "warn",

    // Prefer `(...) {` over `(...){`
    "space-before-blocks": ["warn", "always"],

    // Prefer `let x: string` over `let x:string`
    "@typescript-eslint/type-annotation-spacing": "warn",

    // Prefer `T[]` and `readonly T[]` over `Array<T>` and `ReadonlyArray<T>`
    "@typescript-eslint/array-type": ["warn", {
        "default": "array",
        "readonly": "array",
    }],

    // Prefer `x as foo` over `<foo> x`
    "@typescript-eslint/consistent-type-assertions": ["warn", {
        "assertionStyle": "as",
        "objectLiteralTypeAssertions": "allow-as-parameter",
    }],

    // Prefer `{ a: foo; b: bar; }` over `{ a: foo, b: bar }`
    // Prefer `{ a: foo; b: bar; }` over `{ a: foo; b: bar }`
    "@typescript-eslint/member-delimiter-style": ["warn", {
        "multiline": {
            "delimiter": "semi",
            "requireLast": true,
        },
        "singleline": {
            "delimiter": "semi",
            "requireLast": true,
        },
    }],

    // Prefer assignments like `let foo: 2 as const` over `let foo: 2 = 2`
    "@typescript-eslint/prefer-as-const": "warn",

    // Prefer Array.prototype.includes over Array.prototype.indexOf for
    // inclusion checks
    "@typescript-eslint/prefer-includes": "warn",

    // Prefer object spreads to `Object.assign()`
    "prefer-object-spread": "warn",
};

const disabledRules = {
    "no-inner-declarations": "off",
};

module.exports = {
    "rules": {
        ...possibleErrorRules,
        ...styleRules,
        ...disabledRules,
    }
}
