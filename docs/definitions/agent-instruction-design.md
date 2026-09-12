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

Follow-up source inspected on 2026-09-12:

- [Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)

These are workflow adaptations, not a new skill format or a guarantee of model correctness.
They remain useful across models; do not duplicate instructions into model-specific variants
unless observed behavior requires a maintained difference.

## Instruction Surfaces

The root `README.md` introduces the product, platform flow, and documentation entrypoints.
`AGENTS.md` owns repository operating defaults and task routing. Project Governance owns the
package map and authority boundaries. Skills own bounded workflows; their supporting references
contain details needed only for particular modes. Domain
definitions continue to own technical contracts.
The legacy Junie entrypoint was removed. Repository guidance must not require different wording
or separate test authorization for an already-authorized implementation. The pre-implementation
scope recap in `AGENTS.md` is a user-requested repository checkpoint, distinct from
code review. Reuse approval already given for that recap; do not duplicate the
checkpoint across domain skills or require approval for each validation step.

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

## Follow-up Instruction Audit

The 2026-09-12 comparison inspected the repository entrypoints, all nine skill descriptions and
bodies, UI metadata, and supporting architecture/review references. The descriptions were already
bounded enough to retain. `AGENTS.md` already defined completion and proportional validation;
the remaining issues were in derived guidance:

| Observed instruction | Adjustment |
| --- | --- |
| Legacy Junie instructions required imperative wording and separate permission for test edits | Remove the legacy entrypoint and stale test restrictions; follow `AGENTS.md` and the user's intended outcome |
| Legacy chat bootstrap duplicated project context and invoked architecture for cross-package tasks generally | Remove the bootstrap; use README for product context and AGENTS/skills for task routing |
| Architecture entrypoint repeated source lists and loaded component-specific examples for unrelated decisions | Use one conditional reference table; retain schema rules in the existing schema/artifact reference |
| Preset evidence listed Figma links and file paths as broad applicability signals | Require an official preset authoring or fidelity concern; inspect mechanical edits without reopening upstream sources |
| Icon workflow prescribed generation and broad checks even for analysis or documentation | Distinguish read-only assessment, documentation checks, and behavior-specific implementation validation |
| Projection and tonal workflows mixed analysis with mutation steps | Make the analysis deliverable explicit and retain implementation and asset-approval boundaries |
| New-component reference prescribed Web layers without a platform or scope qualifier | Route native delivery to its platform contracts and preserve partial-task boundaries |

Representative task walkthroughs for these instructions:

| Request | Expected route and completion |
| --- | --- |
| Explain a public article's relevance to the project | Read the article and relevant project context; a relevance question alone does not require a full architecture audit |
| Normalize integer notation in an official schema | Inspect the focused diff and confirm unchanged recipe semantics; preserve evidence and run relevant focused checks |
| Review a canonical icon mapping without changes | Inspect source mapping and existing artifacts; report evidence and freshness limits without generation |
| Assess an existing review report | Revalidate findings without rewriting or clearing the report |
| Review a new diff | Follow review scope and write `CODE-REVIEW.md` unless all writes were explicitly forbidden |
| Fix authorized report findings | Implement and validate; clear the report only when all applicable closure conditions hold |
| Audit tonal version drift | Run the read-only audit and report mismatches; do not relabel approved assets |
| Implement a structural utility projection | Verify canonical eligibility and token policy, preserve the `p` contract, and validate the affected handoff |
| Add a native-only component | Follow canonical Schema and the requested platform's implementation and validation surfaces |

These are instruction-consistency walkthroughs, not measured agent-performance evaluations.
Preserve the full preset color provenance chain, sparse-state exceptions, structural CSS ownership,
and actual visual approval for asset promotion when applying the narrower routing.
