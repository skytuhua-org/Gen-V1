# Issue labels

Use labels to describe the work, its owning area, its difficulty, and its
priority. Apply at least one type and level to each new issue. Add an area and a
priority when known. Tracking issues may omit the area when the tracking work
has no specific area and may omit priority when child issues drive the order.

## Type

| Label | Use for |
| --- | --- |
| `bug` | Broken or incorrect behavior |
| `enhancement` | New features and improvements to existing behavior |
| `documentation` | Documentation changes |
| `type:refactor` | Cleanup that preserves behavior |
| `type:test` | Test coverage, fixes, verification, qualification, and acceptance work |
| `type:security` | Security fixes, hardening, and vulnerable dependencies |
| `type:tracking` | Work that groups related tasks and remains open until its children land |

## Area

| Label | Use for |
| --- | --- |
| `area:frontend` | Web and desktop UI, shared UI components, and widgets |
| `area:runtime` | Server, core, runtime packages, storage, and contracts |
| `area:ci` | CI workflows, test infrastructure, and scripts |
| `area:docs` | Documentation |

## Level

| Label | Use for |
| --- | --- |
| `level:low` | Mechanical work |
| `level:medium` | Focused work with some design or risk |
| `level:high` | Design-heavy work or changes spanning several surfaces |

## Priority

| Label | Use for |
| --- | --- |
| `priority:high` | Release blockers or work that blocks other work in progress |
| `priority:medium` | Normal backlog order |
| `priority:low` | Improvements to pick up after higher-priority work |

Standing labels add context. Use `accessibility` for accessibility barriers,
`ci-test` for flaky, skipped, or missing verification, and `deferred` for work
outside the current scope. Other standing labels include `good first issue`,
`help wanted`, `duplicate`, `invalid`, `question`, and `wontfix`.

The labeler applies a first pass when an issue opens and preserves labels chosen
by the author or template on the same axis. Check the labels on first touch and
correct them if necessary. Use the existing taxonomy and propose additions
through review. [Issue-label rules](../AGENTS.md#issue-labels) · [Labeler workflow](../.github/workflows/issue-labeler.yml)
