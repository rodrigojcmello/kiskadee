---
name: kiskadee-code-review-markdown
description: Kiskadee code review workflow that always writes the review result to a Markdown file in the repository root. Use whenever the user asks Codex to review code changes, staged changes, unstaged changes, untracked files, a branch diff, or a pull-request-style diff in the Kiskadee monorepo, especially when the review needs to be reusable by other agents.
---

# Kiskadee Code Review Markdown

Use this skill to make every Kiskadee code review leave a durable handoff artifact for other
agents.

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

## Kiskadee defaults

- Chat responses stay in Portuguese.
- Code, identifiers, comments, and logs stay in English.
- Do not implement fixes during a review unless the user explicitly asks.
- Do not add or modify tests during review unless the user explicitly asks.
