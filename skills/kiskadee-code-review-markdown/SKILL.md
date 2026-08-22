---
name: kiskadee-code-review-markdown
description: Kiskadee code review and follow-up workflow that writes findings to the repository-root CODE-REVIEW.md and clears it after every recorded finding is fixed and validated. Use when reviewing Kiskadee changes or resolving findings from that handoff file.
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

2. Keep findings sparse and actionable:
- prefer no finding over speculative feedback;
- tie every finding to changed code and a concrete scenario;
- include file paths and line numbers where possible;
- keep inline review directives in the chat response when required by the review UI.

3. Before the final response, write `CODE-REVIEW.md` with this structure:

```md
# Code Review

## Scope

- Request: <what was reviewed>
- Diff source: <staged/unstaged/untracked, branch/base, or PR>
- Generated: <local date/time if available>

## Findings

<Ordered findings, highest severity first. Use "No actionable findings." when applicable.>

## Validation

- <Commands run and outcomes>
- <Commands not run and why>

## Notes For Follow-up Agents

- <Any assumptions, residual risk, or context needed to continue>
```

4. In the final chat response:
- lead with the same findings as the Markdown file;
- mention that the review was saved to `CODE-REVIEW.md`;
- include inline `::code-comment{...}` directives only for actionable changed-line feedback;
- do not paste the whole Markdown file unless the user asks.

## Post-fix cleanup workflow

Use this workflow when the user explicitly asks to correct findings recorded in `CODE-REVIEW.md`:

1. Read the complete file and validate each finding against the current code before editing.
2. Keep the report intact while implementing and validating the authorized corrections.
3. Confirm that every actionable finding in the file is resolved in the current working tree.
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
