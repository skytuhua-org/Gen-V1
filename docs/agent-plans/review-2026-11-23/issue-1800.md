[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1800.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1800](https://github.com/skytuhua-org/Gen-V1/issues/1800). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Brand implementation [#1815](https://github.com/skytuhua-org/Gen-V1/pull/1815) merged at 367d1ed099b933ebaec3ef3b58ef33750d7329ee and focused checks are reported. Required README/sidebar/startup screenshots are not durably attached to the PR; journal references session-local captures. Keep open for that written criterion, not the optional manual social-preview upload.

### Reviewed implementation references

- [PR #1815](https://github.com/skytuhua-org/Gen-V1/pull/1815): merged; merge `367d1ed099b933ebaec3ef3b58ef33750d7329ee`.

Latest journal read: [7094144777](https://github.com/skytuhua-org/Gen-V1/issues/1800#issuecomment-7094144777). Earlier claims, tests, review findings and releases remain in the append-only journal.

### Remaining written acceptance

The merged change is [#1815](https://github.com/skytuhua-org/Gen-V1/pull/1815), merge `367d1ed099b933ebaec3ef3b58ef33750d7329ee`. The journal reports 42 focused checks passed and one skipped, plus typecheck and documentation checks. The PR contains brand artwork, but references the application screenshots as session attachments/local capture paths. The required README header, sidebar and startup-window screenshots must be retrievable from the PR before the last written criterion can be marked complete. The social-preview settings upload is explicitly a separate manual maintainer step in the original scope and is not added as a blocker. Installed Windows icon verification remains disclosed as not run where the PR records it; do not relabel that as an executed test.

---

## Requested outcome

Replace every logo, icon and brand mark in the repository with the new Gen V1 Halftone logo approved by the maintainer: a G made of halftone dots followed by "enV1" in the same dots, in Electric purple `#7C4DFF`. The dots are sharp and full at the G and shrink and frost over towards "V1". The repository README shows the new logo.

## Scope

- Brand asset folder `docs/public/brand/` with SVG/PNG/ICO files and a usage README (frosted logo, flat logo, dot mark, solid mark for 32 px and below, app icons).
- `README.md`: logo at the top of the landing page and a link to the brand folder.
- `docs/public/media/gen-banner.svg`: replace the old green banner with the new logo; update its provenance entry and description.
- Web app (`apps/web/index.html`): favicon.
- Web app sidebar (`apps/web/src/ShellSidebar.tsx`): new mark instead of the generic chat icon.
- Desktop startup window (`apps/desktop/startup.html`): new mark instead of the boxed letter G.
- Desktop tray icon and window icon (`apps/desktop/main.ts`), packaged icon files and `win.icon` in the electron-builder config (`scripts/desktop-assets.ts`, `scripts/build-desktop.ts`).
- `DESIGN.md` brand section and a `CHANGELOG.md` entry.
- A social preview image in the brand folder (uploading it to the repository settings is a manual maintainer step).

Out of scope: application screenshots and recordings under `docs/` (they show the old sidebar icon and are historical captures), retained `third-party/` sources and `docs/implementation`/`docs/review-evidence` provenance.

## Completion criteria

- No remaining reference to the old brand art: the boxed "G" startup mark, the `MessageSquare` sidebar brand icon, the drawn square tray bitmap and the green banner.
- New files are registered in `scripts/public-source-files.json`.
- Focused tests pass: `tests/startup-feedback.test.ts`, `tests/desktop-packaging.test.ts`, `tests/public-source.test.ts`, plus `pnpm typecheck` and `pnpm check:docs-links`.
- Screenshots of the README header, sidebar and startup window are attached to the PR.
