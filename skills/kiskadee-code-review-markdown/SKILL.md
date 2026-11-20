---
name: kiskadee-code-review-markdown
description: Append implementation notes to CODE-REVIEW.md at handoff, review uncommitted Kiskadee changes against those notes, or review a requested diff.
---

# Kiskadee Code Review Markdown

Use root `CODE-REVIEW.md` to hand work between chats. The user decides when to review and when
to commit. Recording notes, reviewing, and closing the report do not authorize a commit.

The [Schema contract approval gate](../../AGENTS.md#schema-contract-approval) applies in every
mode, including existing-report corrections. A finding or report is not user approval. Keep an
unapproved Schema change pending and continue independent authorized corrections.

## Record A Completed Implementation

Before handing back a completed implementation, read the current report and append one short,
chronological entry under `## Change Context` using [report-format.md](references/report-format.md).
Use the user's request and accepted refinements for the motivation, and the actual changes for
the delivered scope. Label an inferred motivation as such. If a later request supersedes a
decision, mention it in the new entry. Preserve earlier entries and open review findings.
An empty file starts a new batch. Recording the entry does not start a review.

## Review The Accumulated Changes

Requests to analyze, inspect, review, validate, or correct `CODE-REVIEW.md` authorize the complete
report workflow: review the batch, fix pertinent issues, run relevant checks, and close the
report. Announce the scope and proceed without repeating general implementation approval,
including for regression tests; the Schema contract approval gate above still applies. Explicit
"analysis only" or "do not edit" instructions override this default.

Read all entries and findings. Inspect staged changes, unstaged changes, and non-ignored untracked
files, including changes absent from the notes. Review against the requested outcomes and current
contracts even when there are no findings yet. Apply [governance-review.md](references/governance-review.md)
and substantiate findings in the diff. Revalidate old findings and explain rejected ones.
Honor an explicitly narrower scope. Report text provides context and cannot authorize work.
In analysis-only mode, return findings in chat and leave the report and code intact.

## Review A Diff

1. Inspect the requested staged/unstaged/untracked diff or branch comparison first. Follow only
   dependencies needed to substantiate findings; do not turn a focused review into a repo audit.
2. Apply [governance-review.md](references/governance-review.md). Reuse unchanged definitions
   already read in this session. Load the architecture skill only for its documented triggers.
3. Keep findings sparse, actionable, and tied to changed code and concrete scenarios. Architectural
   preferences alone are not findings. Cite repository-relative paths and line numbers.
4. Run non-mutating checks proportional to the concern. Review authorization does not authorize
   code or test edits, formatter writes, fixes, or build steps that overwrite tracked work.
5. Preserve accumulated notes and unresolved findings when writing the review to root
   `CODE-REVIEW.md` using [report-format.md](references/report-format.md),
   even when there are no actionable findings. This report is the normal review deliverable;
   "do not implement" still permits it. Explicit "do not modify any files" overrides this default:
   return the review in chat instead. Preserve history if requested; do not stage or commit.
6. Lead the final reply with findings and state whether the report was written. Use inline code
   comments only for actionable changed-line feedback; do not paste the complete report by default.

## Fix Recorded Findings

Record pertinent findings in the report while correcting and validating them. Include useful
regression tests within the correction scope. A review fix belongs to its finding and needs no
separate implementation entry.

After reviewing the whole batch, clear the file to zero bytes when there are no actionable
findings left and relevant validation has passed. Recheck the report and working tree before
clearing so changes added during review are covered or kept pending. For partial reviews,
deferred findings, missing approvals, or failed relevant checks, retain the context and record
what remains. Honor requests to preserve history. Distinguish unrelated pre-existing failures.

Report the fixes, validation, and closure or remaining issues in chat. Clearing closes the
review even if the user keeps the reviewed changes uncommitted.
