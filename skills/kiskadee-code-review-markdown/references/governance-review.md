# Governance Review

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

