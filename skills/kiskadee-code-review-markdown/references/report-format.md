# Review Report Format

At implementation handoff, create only the title and Change Context section if missing.
Append one entry per completed request. Keep each field to a short sentence where possible.
Add the review sections when a review is performed, including reviews with no actionable findings.

```md
# Code Review

## Change Context

### <Short change title>

- Request: <what the user wanted>
- Motivation: <why it matters, from the request or accepted decision>
- Delivered: <what actually changed and where>

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
