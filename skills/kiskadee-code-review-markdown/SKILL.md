---
name: kiskadee-code-review-markdown
description: Review Kiskadee code and project-governance boundaries, persist findings in the repository-root CODE-REVIEW.md, and clear it after every recorded finding is fixed and validated. Use when reviewing Kiskadee changes or resolving findings from that handoff file.
---

# Kiskadee Code Review Markdown

Use this skill to make every Kiskadee code review leave a durable handoff artifact for other
agents and to close that handoff after its findings are resolved.

## Required output file

- Always write the current review to `CODE-REVIEW.md` at the repository root.
- Overwrite `CODE-REVIEW.md` for the latest review unless the user explicitly asks to preserve a
  historical copy.
- Do not stage or commit `CODE-REVIEW.md` unless the user asks.
- If there are no actionable findings, still create the file and state that no actionable issues
  were found.

## Review workflow

1. Review the requested diff first:
- for local work, inspect staged, unstaged, and untracked files;
- for branch reviews, identify the base branch or merge base before reading changed files;
- keep the review focused on bugs, regressions, maintainability risks, security, performance,
  accessibility, and missing validation that the author would likely fix.

2. Run the required governance review described below.

3. Keep findings sparse and actionable:
- prefer no finding over speculative feedback;
- tie every finding to changed code and a concrete scenario;
- include repository-relative file paths and line numbers where possible;
- do not use editor-specific or machine-local links such as `air-file://` in `CODE-REVIEW.md`;
- keep inline review directives in the chat response when required by the review UI.

4. Before the final response, write `CODE-REVIEW.md` with this structure:

```md
# Code Review

## Scope

- Request: <what was reviewed>
- Diff source: <staged/unstaged/untracked, branch/base, or PR>
- Generated: <local date/time if available>

## Governance Review

- Projects and governance surfaces inspected: <relevant project roots and repository-level surfaces>
- Ownership sources: <normative definitions used>
- Composition strategy: Used — <reason and selected strategy> | Not required — <reason>
- Concern flows: <concern>: <authority> -> <transformers> -> <consumers>; result: respected | Finding N
- Architecture skill: Used — <reason> | Not required — <reason>
- Result: No responsibility-boundary violations found. | See Finding N.

## Findings

<Ordered findings, highest severity first. Use "No actionable findings." when applicable.>

## Validation

- <Commands run and outcomes>
- <Commands not run and why>

## Notes For Follow-up Agents

- <Any assumptions, residual risk, or context needed to continue>
```

5. In the final chat response:
- lead with the same findings as the Markdown file;
- mention that the review was saved to `CODE-REVIEW.md`;
- include inline `::code-comment{...}` directives only for actionable changed-line feedback;
- do not paste the whole Markdown file unless the user asks.

## Required governance review

Run this review for every diff, including changes confined to one project:

1. Read `docs/definitions/project-governance.md`.
2. Read `docs/definitions/composition-strategies.md` when the diff introduces or materially changes
   a public component or slot, variant, mode, option, global profile or catalog, Effect, Provider,
   Headless primitive, platform mechanic, or named structural composition pattern. Verify that the
   selected strategy preserves the authority and handoff of its linked normative definition.
3. Group changed files by governed project or repository-governance surface, then group them by
   concern. Treat cross-project definitions, root architecture documents, `AGENTS.md`,
   `CHAT-CONTEXT.md`, and `skills/**` as governance surfaces rather than implementation projects.
   Assign their authority through the documentation precedence in the canonical governance
   definition, not through their directory. Multiple projects changed for unrelated concerns do not
   form one cross-project flow.
4. For each concern, identify the authority/source of truth, any transformers, the published handoff,
   and every affected consumer.
   Do not use the changed file's location or import direction alone as proof of semantic authority.
   For a governance-surface concern, trace the normative definition to its derived summaries,
   instructions, skills, and review behavior.
5. Verify that:
   - the authority remains singular and is changed at the owning project when required;
   - consumers select, adapt, compose, or render the handoff without re-authoring upstream meaning;
   - generated artifacts and fixtures remain derived instead of becoming authoring sources;
   - platform adapters change mechanics without creating parallel Schema or design-system meaning;
   - Showcase remains a consumer and validator rather than a framework authority; and
   - affected consumers validate the changed handoff.
6. Record the result in `## Governance Review` even when no violation exists.

For official preset color diffs, apply `kiskadee-resolve-preset-colors`. In an FRF preset, report a
bypass, a family-relative decision encoded as `exact`, an unregistered or undocumented `exact`, a
physical endpoint encoded as an ordinary tone, or a derived-color formula whose inputs are not FRF.
For a preset that has not migrated, review the legacy lookup against its documented provenance
without claiming FRF compliance.

Use `$kiskadee-architecture` when any of these conditions applies:

- one concern crosses two or more governed projects;
- a repository-governance surface changes or enforces project authority, allowed inputs, published
  handoffs, prohibited ownership, or dependency direction;
- the diff changes Schema/DSPE, a shared public contract, artifact format or emission, provider or
  runtime ownership, or dependency direction;
- the diff introduces a named Composition Strategy or changes the eligibility of an existing one;
- the diff creates or duplicates a source of truth;
- normative documents disagree or leave the owner unclear; or
- the review would need to claim that a concern belongs in another project.

Architecture review is not required merely because mechanically derived artifacts span projects or
because unrelated concerns happen to touch different projects. The governance result must still be
recorded.

A governance finding is actionable only when it:

- points to changed code or a required companion change;
- cites the normative rule and documented authority;
- confirms the current producer-to-consumer flow in code or artifacts; and
- states a concrete consequence such as semantic drift, duplicated sources, inverted dependency,
  manual generation, or a broken handoff.

Architectural preference without a normative rule and concrete consequence is not a finding. If
ownership remains ambiguous after architecture analysis, record the documentation gap under
`Governance Review` or `Notes For Follow-up Agents` instead of accusing the implementation.

A different Composition Strategy is not actionable by preference alone. Record a finding only when
the chosen strategy violates a linked normative contract or creates a concrete ownership, handoff,
semantic, artifact, or runtime consequence.

## Post-fix cleanup workflow

Use this workflow when the user explicitly asks to correct findings recorded in `CODE-REVIEW.md`:

1. Read the complete file and validate each finding against the current code before editing.
2. Keep the report intact while implementing and validating the authorized corrections.
3. Confirm that every actionable finding in the file is resolved in the current working tree. For a
   governance finding, rerun the concern flow and consumer validation before declaring it resolved.
4. After all relevant validation succeeds, clear the contents of `CODE-REVIEW.md` but keep the
   empty file in place.

Do not clear the file when:

- only a subset of its findings was authorized or corrected;
- any finding remains unresolved, blocked, or intentionally deferred;
- a relevant validation fails or the resolution cannot be confirmed; or
- the user explicitly asks to preserve the report as history.

Clearing the file is the final handoff-closing action. Never clear it before the corrections and
their validation are complete. In the final response, state that the recorded findings were
resolved and that `CODE-REVIEW.md` was cleared.

## Kiskadee defaults

- Chat responses stay in Portuguese.
- Code, identifiers, comments, and logs stay in English.
- Do not implement fixes during a review unless the user explicitly asks.
- Do not add or modify tests during review unless the user explicitly asks.
