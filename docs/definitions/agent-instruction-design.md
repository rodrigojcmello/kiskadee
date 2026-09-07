# Agent Instruction Design

Status: repository workflow guidance, subordinate to
[Project Governance](project-governance.md) and the user's task scope.

## Rationale

The September 2026 GPT-6 Astra guidance recommends auditing instructions for ambiguity and
conflicts, defining completion within the authorized scope, and calibrating validation to the
change. The Kiskadee audit applies those principles to repository-owned instructions. It does
not change model settings, installed plugins, package architecture, or runtime behavior.

Sources inspected on 2026-09-07:

- [GPT-6 Astra prompting guidance](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra)
- [Build skills](https://learn.chatgpt.com/docs/build-skills)

These are workflow adaptations, not a new skill format or a guarantee of model correctness.
They remain useful across models; do not duplicate instructions into model-specific variants
unless observed behavior requires a maintained difference.

## Instruction Surfaces

`AGENTS.md` owns repository operating defaults and task routing. `CHAT-CONTEXT.md` summarizes it
for a new conversation. Skills own bounded workflows; their supporting references contain details
needed only for particular modes. Domain definitions continue to own technical contracts.

Descriptions should distinguish when a skill applies. A skill entrypoint retains essential
constraints and explains when to load supporting references. Short, cohesive skills can remain
self-contained; creating a router for every skill would add needless navigation.

Load relevant sources once, reuse them while current, and revisit them when changed or when the
next decision depends on an unread contract. Progressive disclosure must not hide mandatory
source evidence, tonal mapping, public-contract, accessibility, or structural CSS rules.

## Conflicts Resolved By The Audit

| Previous instruction conflict | Resolution |
| --- | --- |
| Bootstrap prohibited test edits while correction skills required regression coverage | Authorized implementation includes meaningful regression tests; analysis does not authorize edits |
| Architecture checklist always required the whole suite and pointed at headless/npm | Select affected-package PNPM checks; broaden when impact or unresolved evidence warrants it |
| Review skill always overwrote the report and also demanded non-mutation | Separate existing-report assessment, new diff review, and authorized fix/closure modes |
| Architecture implementation ended with a verification plan | Execute relevant validation for implementation; provide a plan for analysis-only work |
| Linear creation always asked for another confirmation | Honor the already-authorized task list; clarify missing scope and inspect uncertain writes before retrying |
| Architecture entrypoint loaded new-component and schema-specific procedures for unrelated work | Route conditional procedures to supporting references while retaining ownership constraints |

Ordinary code review still produces `CODE-REVIEW.md` by default. Evaluating an existing report
leaves it intact, and explicitly forbidding all file writes produces a chat-only review.
Successful authorized correction closes the handoff only after its relevant validation passes.

## Evaluation

Validate instruction changes with frontmatter parsing, reference checks, comparison against
normative constraints, and representative task walkthroughs. Check at least the affected modes:
analysis-only, implementation, report assessment, new review, and review correction. A documentation
change does not call for application builds merely because the instructions mention them.

Structural checks cannot prove better model behavior. Assess future tasks for scope adherence,
unnecessary pauses or repeated reads, relevant verification, and correctness of the delivered
result. Do not attribute implementation mistakes to prompt conflicts without evidence.
