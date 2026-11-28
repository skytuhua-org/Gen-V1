# Desktop and renderer workflow correctness audit

## Baseline and scope

Audit `skytuhua-org/Gen-V1` at [`main@20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`](https://github.com/skytuhua-org/Gen-V1/commit/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645). Plan revision `devin-cli-audit-r1`, November 24, 2026. Apply the [repository agent instructions](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/AGENTS.md) and contribution guidance.

This read-only audit prioritizes lost or misattributed user work, async lifecycle and recovery, contract mismatches, accessibility failures that prevent a workflow, and misleading release evidence. It checks the renderer, native host, selected cross-layer seams, and verification coverage. It does not authorize code changes, a redesign, or re-opening findings already tracked by the earlier backend/UX work (#1848, #1860, #1886, #1281, #1973, #1974). Verify overlap during triage. Audited code is pinned to main. Unmerged PRs are context for duplicate checks, not part of the audited tree.

## Execution and acceptance

Use 36 independent Devin CLI audit sessions, each explicitly pinned to `swe-2-1-max`, in waves sized to the client and account. The coordinator runs one actual scope first and verifies the model and file-reading receipt before continuing. Every worker returns the reviewed files, up to three actionable findings with severity, exact line and entry point, trigger, user effect, evidence strength, and suggested fix/test, plus limits. A zero-finding result lists the behaviors checked. Exclude unsupported speculation and report untested behavior as such. Workers send findings to the coordinator, who journals scope and release on this issue, verifies findings against the same SHA, compares open issues and PRs, and publishes a prioritized report with an outcome for all scopes and the actual counts and checks. Source stays read-only. Tests are limited to safe checks that can be run locally with isolated fixtures. No live accounts or physical-device acceptance claims without evidence. No security exploit development.

## Worker assignments

| ID | Scope | Primary source (web names relative to `apps/web/src`) | Audit question |
|---|---|---|---|
| A01 | Root workspace ownership | App.tsx, app-panels.tsx, WorkspaceHost.tsx | Check ownership propagation during project and surface changes, including post-extraction stale async results. |
| A02 | Conversation switching | conversation-workspace/, conversation-placement.ts, conversation-read-api.ts | Check stale response ownership, branch reload, and restoration when rapidly switching threads. |
| A03 | Conversation navigation | ConversationFind.tsx, conversation-find.ts, conversation-scroll.ts, ChatScrollIndicator.tsx | Check search/jump/scroll interaction, focus routing, and streaming timing. |
| A04 | Composer submit lifecycle | ComposerView.tsx, ComposerToolbar.tsx, composer-pointer-press.ts, useComposerPrediction.ts | Check input snapshot, double submission, IME handling, and cancel/focus ownership. |
| A05 | Composer attachments and commands | ComposerAttachments.tsx, ComposerCommands.tsx, composer-commands.ts, composer-evidence.ts | Check attachment and command resolution when composer or project changes. |
| A06 | Draft custody and transfer | SavedDrafts.tsx, DraftTransfer.tsx, draft-transfer.ts, saved-drafts.ts, draft-limits.ts, ScopedConversationComposer.tsx | Check durable drafts, transfer acknowledgements, cancellation and mixed-context state. |
| A07 | Sidebar navigation and reordering | ShellSidebar.tsx, sidebar-reorder.ts, sidebar-thread-move.ts, sidebar-collapse.ts, shell-navigation.ts | Check navigation after pending mutations, ordering correctness and keyboard/pointer behavior. |
| A08 | Project selection and context | ProjectPicker.tsx, ProjectContextSurface.tsx, ProjectContextCard.tsx, project-api.ts, project-context-summary.ts | Check project switch/refresh, stale receipts, selected project and context-owner consistency. |
| A09 | Delegated work workspace | agents-workspace/, DelegatedAgentTranscript.tsx, agent-work-api.ts | Check participant/turn identity, streaming, disposal, cancellation, and progress state. |
| A10 | Inbox and attention | InboxView.tsx, AgentInbox.tsx, useAttention.ts, WorkspaceNotifications.tsx, workspace-notifications.ts | Check unread, dismissal, resync, races and acknowledgement across threads. |
| A11 | Background activity | BackgroundWork.tsx, WorkActivity.tsx, activity-output.ts, WorkObjects.tsx | Check long-running action state, retries, selection, and handling of stale or missing output. |
| A12 | Runtime and model selection | ModelPicker.tsx, runtime-presentation.ts, account-login-monitor.ts | Check model invalidation, runtime refresh, credential status changes, and disabled-state semantics. |
| A13 | Connection and account screens | Connections.tsx, CredentialEntry.tsx, GitHubSignIn.tsx, IntegrationSettings.tsx, IntegrationSecretReferences.tsx, account-api.ts | Check pending/committed state, cancellation, disconnect, and recovery UX across account flows. |
| A14 | Environment and pairing UI | EnvironmentSettings.tsx, PairedDevicesPanel.tsx, ControlConsentPanel.tsx | Check environment/device refresh, stale state, and users' visibility into permission changes. |
| A15 | Settings state and inventory | Settings.tsx, CompactSettings.tsx, settings-data.ts, settings-inventory.ts, settings-operations.ts, settings-registry.ts | Check observable setting effects, pending mutations, errors, and navigation parity. |
| A16 | Appearance and reduced motion | AppearanceSettings.tsx, appearance-draft.ts, useAppearance.ts, motion-policy.ts, motion-spring.ts | Check committed versus draft preferences and runtime reduced-motion changes. |
| A17 | Desktop embedded browser renderer | DesktopBrowser.tsx, browser-slot-bounds.ts, desktop-context.tsx | Check attach/detach, bounds update order, and renderer recovery after host reset. |
| A18 | Native browser lifecycle | apps/desktop/browser-lifecycle.ts, browser-bounds.ts, docked-browser.ts, browser-proxy.ts | Check lifecycle, ownership routing, disposal and duplicate-attach failure recovery. |
| A19 | Window layout and restoration | apps/desktop/display-layout.ts, layout-transaction.ts, window-policy.ts, persistence.ts | Check local layout durability, display changes, aborted moves and stale placement. |
| A20 | Native startup and update | apps/desktop/main.ts, updater.ts, workspace-events.ts, DesktopEntry.tsx, UpdateControl.tsx | Check startup/relaunch/quit ordering, readiness, resource cleanup and error recovery. |
| A21 | Floating workspaces | FloatingWindow.tsx, FloatingRail.tsx, floating-layout.ts, floating-order.ts, panel-geometry.ts | Check ownership of bounds, pointer interruption, minimum geometry, and focus restoration. |
| A22 | Split workspaces | WorkspaceSplitLayout.tsx, split-workspace-api.ts, split-workspace-profiles.ts, split-thread-placement.ts, split-tool-placement.ts | Check allocation and restoration across layout changes, stale actions and duplicate placements. |
| A23 | Files and checkpoints | files/, FileCheckpoints.tsx, file-checkpoint-api.ts | Check file-read cancellation, grants/selection refresh, and restore-confirmation semantics. |
| A24 | Source workbench and editor handoff | SourceWorkbench.tsx, SourceSelectionActions.tsx, editor-handoff.ts, code-review-workspace/ | Check selection/action durability across refresh, branch changes and external handoff. |
| A25 | Workbench recovery and output | WorkbenchOutput.tsx, WorkbenchActivity.tsx, WorkbenchInputsPanel.tsx, workbench-recovery.ts, workbench-input-recovery.ts | Check failed/disconnected runs, recovery thresholds, artifact output and selection custody. |
| A26 | Artifacts and widgets | Artifact.tsx, ArtifactPresentation.tsx, artifact-state.ts, artifact-inputs.ts, Widget.tsx, packages/widgets | Check artifact snapshot ownership, unsaved changes, and compatibility for stored widget payloads. |
| A27 | Documents and PDF | DocumentWindow.tsx, DocumentPreview.tsx, document-evidence.tsx, pdf-draft*.ts | Check worker disposal, stale render results, document identity and unsupported-content errors. |
| A28 | Visual annotation and signature | ImageCompare.tsx, SignaturePad.tsx, signature-assets.tsx | Check input commit/cancel semantics, pointer ownership, release on unmount, and stored asset durability. |
| A29 | Local terminal UI | TerminalBody.tsx, TerminalExcerpt.tsx, terminal-excerpts.ts | Check terminal selection/read errors, row/ANSI handling, refresh and history semantics. |
| A30 | Planning and task rendering | plan-timeline/, PlanStatus.tsx, PlanningQuestion.tsx, TaskDisclosure.tsx, TaskHistory.tsx, TaskTable*.tsx, task-status.tsx | Check terminal status precedence, progress and history consistency, rendering fallback and keyboard behavior. |
| A31 | Project memory presentation | ProjectMemoryReview.tsx, TaskMemory.tsx, project-memory-*.ts, useProjectMemoryPreparation.ts | Check screening/receipt ownership and presentation after restore/retry or project switches. |
| A32 | Plugin presentation lifecycle | PluginFrame.tsx, PluginFloatingWindow.tsx, plugin-frame-client.ts, plugin-runtime.tsx, plugin-validation-policy.ts | Check compatibility, mount/lifecycle recovery and missing-plugin presentation. |
| A33 | Event-to-renderer sync seam | apps/server/event-stream.ts, apps/web/src/snapshot-events.ts, apps/web/src/api.ts, packages/contracts | Check reconnect, replay, duplicate events, omitted fields and supported client state convergence. |
| A34 | Desktop preload-to-server seam | apps/desktop/preload.ts, apps/server/desktop-controls.ts, apps/web/src/workspace-native.ts, packages/desktop-contract | Check contract parity, error mapping, outstanding action resolution, and platform fallbacks. |
| A35 | Browser regression coverage | tests/e2e, playwright.config.ts, tests/fixtures | Look for false passes, divergent fixtures and missing negative assertions in the highest-impact workflows. Cite exact gaps. |
| A36 | Release and packaged-verification evidence | scripts/rc-review, .github/workflows, apps/desktop/README.md, CONTRIBUTING.md | Check whether test and packaging gates actually prove supported desktop workflows; flag specific coverage gaps and misreporting. |
