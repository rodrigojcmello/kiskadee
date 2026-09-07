# Module effects and browser distribution

Core exports contracts, validators and browser utilities. Importing an unused validator must not
force its Zod schemas into a consumer that only needs runtime constants or class helpers.

Public library modules have no externally observable import-time effects. Their initialization
constructs local constants, collections and validation schemas; validation runs when called.
The package sideEffects declaration preserves `*.example.ts`, whose demonstrations log on import.
Do not add registration, global mutation, I/O or other observable initialization to library modules
without updating this declaration and checking downstream bundles.

Validators remain available through the existing root and contract/build entrypoints. This change
does not remove validation or change its authority. Consumer bundle checks live with the React
package, whose public exports exercise the actual web dependency graph. Core contract tests must
continue to verify valid and invalid inputs.
