# Diagram adoption contract — DIA01 frozen decision record

Revision `PARALLEL-RENDERERS-R1/DIA01`, frozen 2026-11-26 by `devin-cloud-44b1bf`.
Corpus: `tests/fixtures/diagram-adoption-corpus.json` (companion artifact, frozen hashes inside).
This record fixes feasibility and source-admission decisions. It does not install
any engine, enable any product surface, or claim adoption success.

## 1. Corpus freeze

The corpus JSON holds 26 entries: 3 useful scenarios frozen verbatim from the
plan as exact LF text plus one CRLF fidelity variant each, and 20 held-out
ordinary examples selected from `mermaid-js/mermaid@2086904e76c692331e34a45d7cc3bc30860d040e`
by this deterministic procedure:

- Candidate paths: `demos/*flowchart*.html`, `docs/syntax/flowchart.md`,
  `docs/diagrams/*flowchart*.mmd`, `e2e/diagrams/flowchart/**.mmd`.
- Sorted lexicographically by path, then by opening line within each file.
- The first 20 distinct, syntactically valid graph/flowchart examples with 2–12
  explicit node IDs were taken. Exclusions applied: exact duplicates, empty,
  oversized. No filtering on Gen's grammar and no rewriting of unsupported syntax.
- Every skipped candidate and reason is recorded in `skippedCandidates` inside the corpus.
- Deterministic outcome note: all 20 come from `demos/dataflowchart.html`,
  `demos/flowchart-elk.html`, `demos/flowchart-step-animation.html` and
  `demos/flowchart.html` because those paths sort first; docs/e2e candidates were
  never reached. This is the procedure's output, not a manual preference.

Annotation independence: expected direction, ordered nodes, ordered edge multiset
and groupings were annotated by reading the frozen source text directly, never by
running any mermaid parser or the trial engine, so downstream render comparison
does not inherit the engine-under-test's own parse. The corpus records these
hand-verified counts and topology.

Freeze correction (corpus version 2, review-driven): the first extraction
miscounted edge-id syntax (`A e1@--> B` counted zero nodes) and silently dropped
examples with YAML frontmatter, so the frozen set was not the deterministic
first-20. Version 2 corrects this: `flowchart-step-animation.html` lines 11/26
(4 and 5 nodes) and `flowchart.html` line 233 (6 nodes, frontmatter retained
verbatim in the source) are included; the subroutine-shape trio beyond the 20th
slot drops out; the skip list records the 15-node frontmatter variants examined
before line 233. YAML frontmatter never disqualifies an example — it is part of
the faithfully retained source.

Several held-out pairs differ only in the `graph` vs `flowchart` keyword or
trailing whitespace; they are not exact duplicates and are retained per the
procedure. Entry `heldout-02` uses the `flowchart-elk` diagram keyword and
entries use modern syntax (`@{shape:}` annotations, edge IDs `e1@-->`,
`accTitle`/`accDescr`) — faithful retention is the point of the corpus;
admission policy is DIA02's scope.

## 2. Module-Worker feasibility (production and packaged routes)

Verified facts:

- An equivalent module Worker already ships in production:
  `apps/web/src/pdf-draft.ts:31` constructs
  `new Worker(new URL('./pdf-draft.worker.ts', import.meta.url), { type: 'module' })`.
- `vite.config.ts` needs no `worker.format` override for this today; build output
  is `dist/web` via `node scripts/build.mjs`.
- The desktop packaged route is the same-origin HTTP route, not `file://`:
  `apps/server/server.ts` (static serving of `dist/web`, see the `dist/web`
  resolution around line 399) serves the shell over the localhost backend origin
  and `apps/desktop/main.ts` loads it with `loadURL` — so a same-origin module
  Worker is not cross-origin in the packaged app.
- The main shell response carries no `Content-Security-Policy` header today
  (CSP exists only on widget/artifact sandbox routes), so no `worker-src`/`script-src`
  relaxation is needed now. If a shell CSP is added later, it must include
  `worker-src 'self'` — recorded here as a constraint, not a permission to relax anything.
- Existing continuous evidence that this mechanism loads on real routes: the
  pdf-draft worker lanes (`tests/e2e/document-preview.spec.ts` with
  `tests/e2e/pdf-test-helper.ts`, plus installed-desktop verification lanes that
  exercise document previews).

Entry-only build command: `node scripts/build.mjs` (repository root). Measured
cost and the emitted worker artifact observation are recorded in section 6.

## 3. Trial engine dependency closure and licensing route

From `beautiful-mermaid@1.1.3` pinned at commit
`65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b` (package.json read at that commit):

- Engine license: MIT. Runtime dependencies exactly: `elkjs@^0.11.0`, `entities@^7.0.1`.
- Verified on the npm registry: `elkjs@0.11.0` = EPL-2.0, `entities@7.0.1` = BSD-2-Clause.
- Dev-only dependencies (shiki, tsup, typescript, bun types) do not ship in the
  runtime closure.

Route decision: all three licenses are notice-permissive (EPL-2.0 is weak copyleft
at file level; bundling unmodified dependency code with license texts preserved is
the ordinary compliant route). Distribution handling: license texts for
beautiful-mermaid, elkjs and entities must be added to `THIRD_PARTY_NOTICES.md`
and surfaced via `apps/web/src/dependency-notices.ts` at adoption time (DIA09 scope);
no automatic incompatibility is claimed here, and no incompatibility is dismissed —
the trial pin's actual installed closure must be re-screened at adoption since
version ranges can resolve newer minors.

## 4. Caller ownership, revision and finality

- Pilot caller 1: the main assistant markdown surface, `apps/web/src/Markdown.tsx`
  (no mermaid/diagram handling exists there today — verified by inspection).
- Pilot caller 2: registry `BoundMarkdown`, `apps/web/src/registry.tsx:198`.
- Owner/revision evidence: both files are unclaimed shared surfaces; no open child
  other than DIA06 binds them (parent #2230 allocation). Local revision pins belong
  to DIA06's own claim step; this contract does not reserve them.
- Finality evidence: **explicit unknown.** No reliable completion signal for
  streaming markdown source exists at this layer; unknown finality means
  newline-only eligibility — a fence may render only when its closing fence and a
  trailing newline are present in the source body — and never a known-final
  assumption derived from a default-false flag or runId absence.

## 5. Source-body slicing boundary

The diagram source is exactly the bytes between the opening fence line's trailing
newline and the closing fence's first character, unmodified: no trimming of
interior whitespace, no CRLF normalization (the corpus carries CRLF fidelity
variants precisely because byte-faithful rendering must tolerate them), no
comment stripping. The fence info string selects eligibility (`mermaid` and, per
DIA02 policy, possibly aliases); the info string itself is never part of the source.

## 6. Removed-Expand-trigger focus fallback

`packages/ui-shell/Modal.tsx` restores focus on close only when the invoking
control is still connected (`previous?.isConnected` guard around line 32); a
removed trigger drops focus to `<body>`. Decision: when adoption replaces an
Expand trigger with inline rendering, the teardown must move focus to a verified
surviving control in this order — (1) the diagram preview leaf's own focusable
control (the preview region with `tabIndex`), (2) the message bubble container of
the source markdown, (3) the composer textarea — the first that is connected and
visible at teardown time. DIA05/DIA06 implement; the fallback ordering is frozen here.

## 7. Build verification record (T04)

Real build observation, this session, Linux x64, Node/pnpm per repo toolchain:

- Command: `node scripts/build.mjs` at repository root (branch
  `devin/44b1bf-dia01-flowchart-corpus`, content-identical web inputs to main@563f607b).
- Result: exit 0, built in 6.20s.
- Emitted module-worker artifact observed in the production bundle:
  `dist/web/assets/pdf-draft.worker-BsXEv1s_.js` — proving the entry-only build
  already compiles a same-origin `{ type: 'module' }` worker into the production
  output with no extra configuration.
- Load-path evidence on real routes: the existing pdf-draft browser lane
  (`tests/e2e/document-preview.spec.ts` + `tests/e2e/pdf-test-helper.ts`, which
  intercepts worker construction in the served app) and the installed-desktop
  verification lanes exercise this mechanism continuously; a diagram worker would
  use the identical construction pattern.

Conclusion: same-origin module Worker loading on the production/packaged route is
FEASIBLE with the existing build mechanism; no CSP relaxation, no new build
tooling, no engine installation implied by this contract. DIA09's certified entry
can follow the pdf-draft pattern exactly.
