---
name: kiskadee-linear
description: Linear workflow for the Kiskadee monorepo. Use when creating, updating, curating, or reading Kiskadee issues in Linear, especially when turning chat decisions, handoff notes, or implementation follow-ups into backlog items.
---

# Kiskadee Linear Skill

Use this skill when managing Kiskadee work in Linear.

## Scope

This skill owns the repository workflow for Linear issues. It is intentionally separate from
`kiskadee-architecture`: architecture decisions belong there, while backlog capture and issue
formatting belong here.

## Defaults

- Team: `Kiskadee`.
- Project: use the existing Kiskadee project when the task belongs to the active Kiskadee backlog.
- Issue titles: Portuguese, short, objective, and action-oriented.
- Issue descriptions: Portuguese, clear enough for another assistant or contributor to continue.
- Labels: English.
- Labels must be re-read before use when precision matters; do not assume older label names still
  exist or have the same grouping.
- Store machine-needed context in the issue description, not only in comments.

## Title Rules

Write titles as a concise task, not as a paragraph.

Prefer:

- `Ajustar halo do Switch Material`
- `Documentar contrato de activationFeedback`
- `Revisar cores disabled do Switch`

Avoid:

- Long explanations.
- Ambiguous titles like `Switch`, `Bug`, or `Melhoria`.
- Implementation-only details when the real task is broader.

## Description Template

Use this structure unless the user asks for another shape:

```md
## Contexto

<Why this task exists. Mention the user-facing or architecture concern.>

## Objetivo

<What should be true when the issue is done.>

## Escopo

- <Concrete area/file/package/component.>
- <What is included.>
- <What is intentionally out of scope, when useful.>

## Validação

- <Build/typecheck/artifact/browser validation expected.>
```

Keep descriptions practical. Include enough context to avoid relying on chat history, but do not
copy long conversations into Linear.

## Label Rules

- Keep labels in English even when title and description are Portuguese.
- Prefer existing labels over creating new labels.
- Verify label grouping before creating labels or label groups.
- When updating issue labels, resend the complete intended label set because updates can replace
  the existing label list.
- If two useful labels conflict due to exclusive groups, keep the most important label and move
  the secondary categorization into the description.

## Creation Workflow

1. Confirm the actual task list with the user before creating issues.
2. List the relevant team/project/labels when the current identifiers are not already known.
3. Create issues in small batches.
4. After creation, report identifiers, titles, and any labels/project assignment used.
5. If a Linear tool fails or reveals taxonomy ambiguity, stop and explain before creating more
   issues.
