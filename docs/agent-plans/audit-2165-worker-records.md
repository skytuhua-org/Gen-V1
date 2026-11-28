# Devin audit worker records

The audited commit was `20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`. The 36 individual records below were transcribed after the audit from the original structured CLI receipts. They retain the actual activity times and worker names. The coordinator posted these retrospective records because the original worker sessions ran with source-read permissions. Each accepted receipt contained `OWNER=NONE`.

[Canonical issue](https://github.com/skytuhua-org/Gen-V1/issues/2165) · [Original final audit and release](https://github.com/skytuhua-org/Gen-V1/issues/2165#issuecomment-7147187999)

### A01

**Root workspace ownership** · devin-local-ec8384

- Scope. Check ownership propagation during project and surface changes, including post-extraction stale async results.
- Planned paths. App.tsx, app-panels.tsx, WorkspaceHost.tsx
- Original session. 2026-11-24T22:32:02.391Z to 2026-11-24T22:40:04.465Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/AGENTS.md)
- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/ProjectPicker.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ProjectPicker.tsx)
- [apps/web/src/WorkspaceHost.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceHost.tsx)
- [apps/web/src/WorkspaceSplitLayout.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceSplitLayout.tsx)
- [apps/web/src/agents-workspace/AgentsWorkspace.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agents-workspace/AgentsWorkspace.tsx)
- [apps/web/src/agents-workspace/composer.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agents-workspace/composer.ts)
- [apps/web/src/api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/api.ts)
- [apps/web/src/app-panels.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/app-panels.tsx)
- [apps/web/src/conversation-placement.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-placement.ts)
- [apps/web/src/desktop-context.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/desktop-context.tsx)
- [apps/web/src/editor-handoff.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/editor-handoff.ts)
- [apps/web/src/project-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/project-api.ts)
- [apps/web/src/split-thread-placement.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/split-thread-placement.ts)
- [apps/web/src/split-workspace-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/split-workspace-api.ts)
- [apps/web/src/useProjectMemoryPreparation.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/useProjectMemoryPreparation.ts)
- [apps/web/src/workspace-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/workspace-api.ts)
- [apps/web/src/workspace-native.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/workspace-native.ts)
- [packages/desktop-contract/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/desktop-contract/index.ts)
- [packages/workspace/tools.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/workspace/tools.ts)
- [tests/e2e/project-app-integration.spec.mjs](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/project-app-integration.spec.mjs)
- [tests/e2e/project-picker.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/project-picker.spec.ts)
- [tests/e2e/workbench-app.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/workbench-app.spec.ts)
- [tests/e2e/workbench-native-return-fixture.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/workbench-native-return-fixture.ts)
- [tests/e2e/workspace-host.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/workspace-host.spec.ts)
- [tests/e2e/workspace-ui.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/workspace-ui.spec.ts)
- [tests/split-thread-placement.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/split-thread-placement.test.ts)
- [tests/split-workspace-repository.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/split-workspace-repository.test.ts)
- [tests/task-interface-fixture.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/task-interface-fixture.test.ts)

Shareable finding dispositions.

- **A01.1 · P2** Stale project-selection dialogs can overwrite a concurrently assigned thread project. Project connection can use the latest global workspace revision with an old user intent. Checked both renderer call sites, queue basis at dispatch, and the server transaction write. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx#L515)

### A02

**Conversation switching** · devin-local-dcb8be

- Scope. Check stale response ownership, branch reload, and restoration when rapidly switching threads.
- Planned paths. conversation-workspace/, conversation-placement.ts, conversation-read-api.ts
- Original session. 2026-11-24T22:32:48.567Z to 2026-11-24T22:48:56.174Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/server/conversation-read-routes.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/server/conversation-read-routes.ts)
- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/ConversationFind.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ConversationFind.tsx)
- [apps/web/src/SessionBranchMenu.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/SessionBranchMenu.tsx)
- [apps/web/src/api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/api.ts)
- [apps/web/src/conversation-placement.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-placement.ts)
- [apps/web/src/conversation-read-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-read-api.ts)
- [apps/web/src/conversation-scroll.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-scroll.ts)
- [apps/web/src/conversation-workspace/ConversationPane.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-workspace/ConversationPane.tsx)
- [apps/web/src/conversation-workspace/reader.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-workspace/reader.ts)
- [apps/web/src/conversation-workspace/useScopedConversation.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-workspace/useScopedConversation.ts)
- [apps/web/src/session-branch-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/session-branch-api.ts)
- [apps/web/src/split-thread-placement.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/split-thread-placement.ts)
- [apps/web/src/split-workspace-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/split-workspace-api.ts)
- [packages/contracts/conversation-read-models.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/conversation-read-models.ts)
- [packages/core/conversation-read-models.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/conversation-read-models.ts)
- [packages/core/split-workspace-layout.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/split-workspace-layout.ts)
- [packages/core/split-workspace.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/split-workspace.ts)
- [packages/storage/store.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/storage/store.ts)
- [tests/conversation-placement.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/conversation-placement.test.ts)
- [tests/conversation-read-api.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/conversation-read-api.test.ts)
- [tests/conversation-read-http.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/conversation-read-http.test.ts)
- [tests/conversation-read-models.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/conversation-read-models.test.ts)
- [tests/e2e/scoped-conversation.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/scoped-conversation.spec.ts)
- [tests/scoped-conversation-reader.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/scoped-conversation-reader.test.ts)

Shareable finding dispositions.

- **A02.1 · P2** Rapid split-workspace thread switches queue stale layout revisions and discard the latest selection. The dispatch queue serializes transport but captures and embeds the revision before the previous selection commits. The later user selection can be refused and the current layout preserved. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/split-workspace-api.ts#L28) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1966)
- **A02.2 · P2** A stale branch-action reload can overwrite the newly selected thread's branch overview. The hook uses a common generation counter and the delayed action can invoke the old reload closure after the new thread is active. The resulting old response has the latest generation. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/SessionBranchMenu.tsx#L24)
- **A02.3 · P2** Unapplied pending placement recovery can restore an archived or missing main conversation. The unchanged-revision pending branch returns stored main placement before the ordinary inventory reconciliation. A production restart or browser pass remains pending. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-placement.ts#L218) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1966)

### A03

**Conversation navigation** · devin-local-327d93

- Scope. Check search/jump/scroll interaction, focus routing, and streaming timing.
- Planned paths. ConversationFind.tsx, conversation-find.ts, conversation-scroll.ts, ChatScrollIndicator.tsx
- Original session. 2026-11-24T22:32:48.774Z to 2026-11-24T22:48:29.085Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/ChatScrollIndicator.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ChatScrollIndicator.tsx)
- [apps/web/src/ConversationFind.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ConversationFind.tsx)
- [apps/web/src/Markdown.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/Markdown.tsx)
- [apps/web/src/SentenceReveal.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/SentenceReveal.tsx)
- [apps/web/src/chat-scroll-indicator.css](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/chat-scroll-indicator.css)
- [apps/web/src/conversation-find.css](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-find.css)
- [apps/web/src/conversation-find.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-find.ts)
- [apps/web/src/conversation-scroll.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-scroll.ts)
- [apps/web/src/conversation-workspace/ConversationPane.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-workspace/ConversationPane.tsx)
- [apps/web/src/conversation-workspace/reader.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-workspace/reader.ts)
- [apps/web/src/conversation-workspace/useScopedConversation.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-workspace/useScopedConversation.ts)
- [apps/web/src/keyboard-bindings.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/keyboard-bindings.ts)
- [apps/web/src/motion-policy.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/motion-policy.ts)
- [apps/web/src/motion-spring.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/motion-spring.ts)
- [apps/web/src/shell-layout.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/shell-layout.ts)
- [apps/web/src/thread-messages.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/thread-messages.ts)
- [packages/ui-shell/ChatView.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/ui-shell/ChatView.tsx)
- [tests/conversation-find.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/conversation-find.test.ts)
- [tests/conversation-scroll.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/conversation-scroll.test.ts)
- [tests/e2e/conversation-find.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/conversation-find.spec.ts)
- [tests/e2e/conversation-scroll.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/conversation-scroll.spec.ts)
- [tests/e2e/frontend.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/frontend.spec.ts)
- [tests/e2e/scoped-conversation.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/scoped-conversation.spec.ts)
- [tests/e2e/workspace-ui.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/workspace-ui.spec.ts)

Shareable finding dispositions.

- **A03.1 · P2** Find jumps clamped at the tail never detach streaming tail-follow. Main transcript clears a notification flag without recording a manual reading state when Find writes a scroll position that is already clamped. The scope-specific listener explicitly sets follow=false. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx#L1098) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1965)
- **A03.2 · P2** Jump to latest removes the focused button without moving keyboard focus. Both main and scoped Jump to latest controls are removed after activation. Neither handler transfers focus to the focusable transcript. Verify actual keyboard focus in browser. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-workspace/ConversationPane.tsx#L92) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1965)

### A04

**Composer submit lifecycle** · devin-local-61c0b7

- Scope. Check input snapshot, double submission, IME handling, and cancel/focus ownership.
- Planned paths. ComposerView.tsx, ComposerToolbar.tsx, composer-pointer-press.ts, useComposerPrediction.ts
- Original session. 2026-11-24T22:32:48.981Z to 2026-11-24T22:49:04.603Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/server/server.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/server/server.ts)
- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/ComposerCommands.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ComposerCommands.tsx)
- [apps/web/src/ComposerToolbar.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ComposerToolbar.tsx)
- [apps/web/src/ComposerView.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ComposerView.tsx)
- [apps/web/src/DesktopEntry.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/DesktopEntry.tsx)
- [apps/web/src/ScopedConversationComposer.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ScopedConversationComposer.tsx)
- [apps/web/src/SideChat.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/SideChat.tsx)
- [apps/web/src/WorkspaceHost.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceHost.tsx)
- [apps/web/src/agents-workspace/AgentsWorkspace.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agents-workspace/AgentsWorkspace.tsx)
- [apps/web/src/agents-workspace/composer.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agents-workspace/composer.ts)
- [apps/web/src/api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/api.ts)
- [apps/web/src/composer-commands.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/composer-commands.ts)
- [apps/web/src/composer-pointer-press.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/composer-pointer-press.ts)
- [apps/web/src/useComposerPrediction.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/useComposerPrediction.ts)
- [packages/core/service.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/service.ts)
- [packages/storage/store.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/storage/store.ts)
- [packages/ui-shell/list-navigation.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/ui-shell/list-navigation.ts)
- [tests/agents-workspace-composer.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/agents-workspace-composer.test.ts)
- [tests/composer-prediction-client.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/composer-prediction-client.test.ts)
- [tests/e2e/composer-app-refinement.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/composer-app-refinement.spec.ts)
- [tests/e2e/composer-commands.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/composer-commands.spec.ts)
- [tests/e2e/composer-integration.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/composer-integration.spec.ts)
- [tests/e2e/terminal-excerpts.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/terminal-excerpts.spec.ts)
- [tests/side-chat.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/side-chat.test.ts)

Shareable finding dispositions.

- **A04.1 · P2** Detached-thread composer retries uncertain sends under a new command id. The detached path omits a stable send ID and does not journal the uncertain command. After an accepted response is lost, a later retry can become a second command once work is idle. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx#L308) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1968)
- **A04.2 · P2** Side-question recovery is not idempotent across uncertain transport. Both side-thread create and side-message POSTs omit a durable exact command ID. Lost acknowledgments permit a distinct create or send on later retry. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/SideChat.tsx#L53) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1968)
- **A04.3 · P3** Bare /btw or /side is consumed as a no-op and the draft is cleared. Exact alias dispatch runs ahead of the menu and delegates an empty body to a SideChat path that returns without sending. The main composer then clears the matching draft generation. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx#L288)

### A05

**Composer attachments and commands** · devin-local-9e9717

- Scope. Check attachment and command resolution when composer or project changes.
- Planned paths. ComposerAttachments.tsx, ComposerCommands.tsx, composer-commands.ts, composer-evidence.ts
- Original session. 2026-11-24T22:32:49.175Z to 2026-11-24T22:40:34.839Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/ComposerAttachments.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ComposerAttachments.tsx)
- [apps/web/src/ComposerCommands.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ComposerCommands.tsx)
- [apps/web/src/ComposerToolbar.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ComposerToolbar.tsx)
- [apps/web/src/ScopedConversationComposer.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ScopedConversationComposer.tsx)
- [apps/web/src/TerminalBody.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/TerminalBody.tsx)
- [apps/web/src/TerminalExcerpt.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/TerminalExcerpt.tsx)
- [apps/web/src/WorkspaceHost.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceHost.tsx)
- [apps/web/src/agents-workspace/AgentsWorkspace.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agents-workspace/AgentsWorkspace.tsx)
- [apps/web/src/agents-workspace/composer.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agents-workspace/composer.ts)
- [apps/web/src/composer-commands.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/composer-commands.ts)
- [apps/web/src/composer-evidence.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/composer-evidence.ts)
- [apps/web/src/desktop-context.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/desktop-context.tsx)
- [apps/web/src/skill-catalog-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/skill-catalog-api.ts)
- [apps/web/src/terminal-excerpts.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/terminal-excerpts.ts)
- [packages/capabilities/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/capabilities/index.ts)
- [packages/capabilities/process.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/capabilities/process.ts)
- [packages/skill-catalog/adapters.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/skill-catalog/adapters.ts)
- [packages/skill-catalog/repository.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/skill-catalog/repository.ts)
- [tests/agents-workspace-composer.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/agents-workspace-composer.test.ts)
- [tests/composer-commands.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/composer-commands.test.ts)
- [tests/composer-evidence.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/composer-evidence.test.ts)
- [tests/e2e/composer-commands.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/composer-commands.spec.ts)
- [tests/e2e/terminal-excerpts.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/terminal-excerpts.spec.ts)
- [tests/e2e/workspace-host.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/workspace-host.spec.ts)

Shareable finding dispositions.

- **A05.1 · P2** Main composer slash-mode commands are not fenced when desktop ownership changes. The scheduled command closure does not check the synchronous owner or pass an isCurrent predicate. Other composers provide a concrete comparison. The native timing case was not exercised. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx#L342)
- **A05.2 · P2** Composer change counts treat truncated or failed git diff output as complete. Synthetic Node probe at pinned source showed identical +1/−1 for complete and truncated output, +0/−0 for failure, and +1/−1 for cancelled partial output. [Probe](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/composer-evidence.ts#L5)

### A06

**Draft custody and transfer** · devin-local-b9499f

- Scope. Check durable drafts, transfer acknowledgements, cancellation and mixed-context state.
- Planned paths. SavedDrafts.tsx, DraftTransfer.tsx, draft-transfer.ts, saved-drafts.ts, draft-limits.ts, ScopedConversationComposer.tsx
- Original session. 2026-11-24T22:32:49.375Z to 2026-11-24T22:47:32.625Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/DraftTransfer.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/DraftTransfer.tsx)
- [apps/web/src/SavedDrafts.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/SavedDrafts.tsx)
- [apps/web/src/ScopedConversationComposer.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ScopedConversationComposer.tsx)
- [apps/web/src/agents-workspace/composer.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agents-workspace/composer.ts)
- [apps/web/src/composer-skill-drafts.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/composer-skill-drafts.ts)
- [apps/web/src/draft-limits.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/draft-limits.ts)
- [apps/web/src/draft-transfer.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/draft-transfer.ts)
- [apps/web/src/editor-handoff.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/editor-handoff.ts)
- [apps/web/src/journal.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/journal.ts)
- [apps/web/src/project-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/project-api.ts)
- [apps/web/src/saved-drafts.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/saved-drafts.ts)
- [apps/web/src/terminal-excerpts.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/terminal-excerpts.ts)
- [apps/web/src/workbench-recovery.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/workbench-recovery.ts)
- [packages/contracts/conversation-read-models.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/conversation-read-models.ts)
- [packages/contracts/shell-read-models.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/shell-read-models.ts)
- [packages/contracts/source-selection.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/source-selection.ts)
- [packages/core/shell-read-models.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/shell-read-models.ts)
- [tests/agents-workspace-composer.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/agents-workspace-composer.test.ts)
- [tests/compact-draft-transfer.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/compact-draft-transfer.test.ts)
- [tests/draft-transfer.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/draft-transfer.test.ts)
- [tests/e2e/saved-drafts.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/saved-drafts.spec.ts)
- [tests/saved-drafts.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/saved-drafts.test.ts)
- [tests/source-composer-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/source-composer-v3.test.ts)
- [tests/source-draft-transfer-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/source-draft-transfer-v3.test.ts)

Shareable finding dispositions.

- **A06.1 · P2** A workspace replacement permanently strands a pending source-attached retry. The owner mismatch correctly blocks dispatch, but returns before either receipt success or authenticated rejection can retire the pending record. The retained input is still present. A repair must allow receipt resolution or explicit abandonment without sending it under the new owner. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agents-workspace/composer.ts#L176)
- **A06.2 · P2** Move browser drafts omits durable named drafts and composer-scoped draft attachments. Prior persistence audit §F records the missing named draft library. The current audit independently confirms it and identifies the additional composer-skill and terminal excerpt key families that are omitted. All source entries remain on the old browser. [Source, previously tracked](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/draft-transfer.ts#L13) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1946)

### A07

**Sidebar navigation and reordering** · devin-local-ebf0b3

- Scope. Check navigation after pending mutations, ordering correctness and keyboard/pointer behavior.
- Planned paths. ShellSidebar.tsx, sidebar-reorder.ts, sidebar-thread-move.ts, sidebar-collapse.ts, shell-navigation.ts
- Original session. 2026-11-24T22:32:49.577Z to 2026-11-24T22:42:00.222Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/ShellSidebar.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ShellSidebar.tsx)
- [apps/web/src/WorkspaceHost.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceHost.tsx)
- [apps/web/src/keyboard-bindings.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/keyboard-bindings.ts)
- [apps/web/src/shell-layout.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/shell-layout.ts)
- [apps/web/src/shell-navigation.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/shell-navigation.ts)
- [apps/web/src/shell-read-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/shell-read-api.ts)
- [apps/web/src/sidebar-collapse.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/sidebar-collapse.ts)
- [apps/web/src/sidebar-reorder.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/sidebar-reorder.ts)
- [apps/web/src/sidebar-thread-move.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/sidebar-thread-move.ts)
- [apps/web/src/task-motion.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/task-motion.tsx)
- [apps/web/src/thread-search.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/thread-search.ts)
- [packages/contracts/preferences.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/preferences.ts)
- [packages/contracts/shell-read-models.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/shell-read-models.ts)
- [packages/core/shell-read-models.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/shell-read-models.ts)
- [tests/e2e/sidebar-collapse.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/sidebar-collapse.spec.ts)
- [tests/e2e/sidebar-shared-menu-fixture.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/sidebar-shared-menu-fixture.tsx)
- [tests/e2e/sidebar-shared-menu.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/sidebar-shared-menu.spec.ts)
- [tests/e2e/thread-move-fixture.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/thread-move-fixture.tsx)
- [tests/e2e/thread-move.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/thread-move.spec.ts)
- [tests/e2e/workspace-host.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/workspace-host.spec.ts)
- [tests/shell-navigation-scale.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/shell-navigation-scale.test.ts)
- [tests/shell-read-models.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/shell-read-models.test.ts)
- [tests/sidebar-project-order.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/sidebar-project-order.test.ts)
- [tests/sidebar-reorder.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/sidebar-reorder.test.ts)

Shareable finding dispositions.

- **A07.1 · P2** All Agents navigation accepts manual order writes but renders created-desc page order. Exact rediscovery of prior frontend audit §4.8 (R2-F4). The persisted order survives, while the All Agents monitor renders created-desc data. Downgraded P1 because the defect affects displayed ordering and has no demonstrated destructive mutation. [Source, previously tracked](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceHost.tsx#L274) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1966)
- **A07.2 · P2** Rapid reorder gestures are computed from stale rows or silently dropped while the first write is pending. Keyboard move derives insertion from current rows and acknowledges immediately; MonitorShell has a pending-mutation guard and refreshes after dispatch. Fixture waits after each key, leaving repeat behavior unasserted. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/sidebar-reorder.ts#L171)
- **A07.3 · P2** Escape does not cancel an active touch reorder; pointerup still commits the drop. The Escape listener clears outer drag UI state while pointerup commits from the independent held gesture. Hardware touch and keyboard combination remains unexercised. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/sidebar-reorder.ts#L285)

### A08

**Project selection and context** · devin-local-95ddb1

- Scope. Check project switch/refresh, stale receipts, selected project and context-owner consistency.
- Planned paths. ProjectPicker.tsx, ProjectContextSurface.tsx, ProjectContextCard.tsx, project-api.ts, project-context-summary.ts
- Original session. 2026-11-24T22:32:49.793Z to 2026-11-24T22:42:11.857Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/server/hermes-service.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/server/hermes-service.ts)
- [apps/server/workspace-routes.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/server/workspace-routes.ts)
- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/ProjectContextCard.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ProjectContextCard.tsx)
- [apps/web/src/ProjectContextSurface.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ProjectContextSurface.tsx)
- [apps/web/src/ProjectPicker.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ProjectPicker.tsx)
- [apps/web/src/WorkspaceSurfaceBody.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceSurfaceBody.tsx)
- [apps/web/src/plan-visibility.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/plan-visibility.ts)
- [apps/web/src/project-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/project-api.ts)
- [apps/web/src/project-colors.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/project-colors.ts)
- [apps/web/src/project-context-summary.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/project-context-summary.ts)
- [packages/contracts/workspace-action-outcomes.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/workspace-action-outcomes.ts)
- [packages/contracts/workspace.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/workspace.ts)
- [packages/core/service.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/service.ts)
- [packages/ui-shell/SummaryDock.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/ui-shell/SummaryDock.tsx)
- [packages/workspace/action-outcomes.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/workspace/action-outcomes.ts)
- [packages/workspace/tools.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/workspace/tools.ts)
- [tests/e2e/project-app-integration.spec.mjs](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/project-app-integration.spec.mjs)
- [tests/e2e/project-picker-fixture.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/project-picker-fixture.tsx)
- [tests/e2e/project-picker.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/project-picker.spec.ts)
- [tests/project-action-owner.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/project-action-owner.test.ts)
- [tests/project-context-committed-action.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/project-context-committed-action.test.ts)
- [tests/project-context-owner.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/project-context-owner.test.ts)
- [tests/project-context-summary.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/project-context-summary.test.ts)
- [tests/workspace-action-outcome-authority.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/workspace-action-outcome-authority.test.ts)

Shareable finding dispositions.

- **A08.1 · P2** Project overview keeps the pre-workspace root context after the first run prepares a managed copy. Related prior audit §8.4 documents divergent context readers. This result traces the concrete null-to-managed-workspace transition omitted only by the overview caller. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ProjectContextSurface.tsx#L12) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1975)
- **A08.2 · P3** Branch and commit controls are enabled for read-only legacy Git contexts even though the server cannot perform those writes there. The read-only legacy context can have git=true and gitWrite=false. Branch and commit controls gate on git, while the managed-family write path requires gitWrite. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ProjectContextCard.tsx#L37)
- **A08.3 · P2** Failed project actions leave stale context and discard the original action identity needed for receipt recovery. The project hook refresh occurs only after the awaited POST succeeds. The prior committed-owner fix in PR #448 applies to success under suspended rendering, a different failure mode. Uncertain-receipt recovery also relates to #1968. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/project-api.ts#L23) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1975)

### A09

**Delegated work workspace** · devin-local-136d93

- Scope. Check participant/turn identity, streaming, disposal, cancellation, and progress state.
- Planned paths. agents-workspace/, DelegatedAgentTranscript.tsx, agent-work-api.ts
- Original session. 2026-11-24T22:40:09.087Z to 2026-11-24T22:48:46.962Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/server/agent-work-routes.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/server/agent-work-routes.ts)
- [apps/web/src/DelegatedAgentTranscript.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/DelegatedAgentTranscript.tsx)
- [apps/web/src/agent-work-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agent-work-api.ts)
- [apps/web/src/agents-workspace/AgentWorkPanel.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agents-workspace/AgentWorkPanel.tsx)
- [apps/web/src/agents-workspace/AgentsWorkspace.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agents-workspace/AgentsWorkspace.tsx)
- [apps/web/src/agents-workspace/controller.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agents-workspace/controller.ts)
- [apps/web/src/agents-workspace/follow-up.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agents-workspace/follow-up.ts)
- [apps/web/src/agents-workspace/transport.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agents-workspace/transport.ts)
- [apps/web/src/thread-messages.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/thread-messages.ts)
- [packages/core/agent-inbox.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/agent-inbox.ts)
- [packages/core/agent-work.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/agent-work.ts)
- [packages/core/planning.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/planning.ts)
- [packages/core/service.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/service.ts)
- [packages/storage/store.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/storage/store.ts)
- [tests/agent-work-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/agent-work-v3.test.ts)
- [tests/agents-workspace-follow-up.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/agents-workspace-follow-up.test.ts)
- [tests/agents-workspace-integration.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/agents-workspace-integration.test.ts)
- [tests/agents-workspace-transport.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/agents-workspace-transport.test.ts)
- [tests/store.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/store.test.ts)
- [tests/thread-messages-owner.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/thread-messages-owner.test.ts)

Shareable finding dispositions.

- **A09.1 · P2** Follow-ups sent while work is QUEUED are marked UNKNOWN and never delivered. Real AgentWorkCoordinator and SQLite Store with a delayed synthetic runtime factory recorded the follow-up UNKNOWN while QUEUED, retained that status after START, and never called the child for FOLLOW_UP. Existing M09 issue #2042 owns this delivery/queue contract; the probe provides an explicit current-baseline case. [Probe](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/agent-work.ts#L414) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/2042)
- **A09.2 · P1** Cancelling a queued input can succeed after dispatch has already begun. Real AgentWorkCoordinator/AgentInbox with SQLite and a controlled synthetic child first entered FOLLOW_UP, then accepted cancellation. After the child completed, the stored receipt remained REJECTED. The healthy control ended ENTERED_RUNTIME. Existing M09 issue #2042 owns this delivery/queue contract; the probe provides an explicit current-baseline case. [Probe](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/agent-work.ts#L422) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/2042)
- **A09.3 · P3** Older transcript pages can be reversed when adjacent messages share a timestamp. A stable createdAt sort keeps existing newer-page messages before newly fetched older ones when timestamps tie, despite the storage page order. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/thread-messages.ts#L49) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1965)

### A10

**Inbox and attention** · devin-local-a35aea

- Scope. Check unread, dismissal, resync, races and acknowledgement across threads.
- Planned paths. InboxView.tsx, AgentInbox.tsx, useAttention.ts, WorkspaceNotifications.tsx, workspace-notifications.ts
- Original session. 2026-11-24T22:40:36.633Z to 2026-11-24T22:45:17.928Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/desktop/attention-popups.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/attention-popups.ts)
- [apps/desktop/main.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts)
- [apps/server/attention-routes.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/server/attention-routes.ts)
- [apps/server/host.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/server/host.ts)
- [apps/web/src/AgentInbox.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/AgentInbox.tsx)
- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/InboxView.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/InboxView.tsx)
- [apps/web/src/WorkspaceNotifications.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceNotifications.tsx)
- [apps/web/src/api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/api.ts)
- [apps/web/src/useAttention.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/useAttention.ts)
- [apps/web/src/workspace-notifications.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/workspace-notifications.ts)
- [packages/contracts/attention.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/attention.ts)
- [packages/core/attention.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/attention.ts)
- [packages/core/service.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/service.ts)
- [packages/ui-shell/Popover.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/ui-shell/Popover.tsx)
- [tests/attention-boundaries.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/attention-boundaries.test.ts)
- [tests/attention-popups.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/attention-popups.test.ts)
- [tests/attention-service-lifecycle.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/attention-service-lifecycle.test.ts)
- [tests/attention.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/attention.test.ts)
- [tests/e2e/workspace-notifications.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/workspace-notifications.spec.ts)
- [tests/inbox-presentation.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/inbox-presentation.test.ts)
- [tests/workspace-notifications.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/workspace-notifications.test.ts)

Shareable finding dispositions.

- **A10.1 · P2** Popup delivery is consumed before the native surface exists, so a transient creation failure permanently drops the alert. A fault-injection fixture against createAttentionPopups showed two reads, one creation attempt and zero displays for one consume-once alert after transient window failure. It displayed once with a healthy window or with a repeated delivery. Production claimDelivery clears pending before presentation. The Inbox entry remains durable. [Probe](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/attention-popups.ts#L27)
- **A10.2 · P2** Popup Open marks an item read before the conversation is actually opened or acknowledged by the renderer. Backend markOpen records the read before returning the destination; native window dispatch and renderer selection happen afterward without a success acknowledgment. Verify with a failing native open/selection fixture before implementation. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/attention.ts#L80)

### A11

**Background activity** · devin-local-39723f

- Scope. Check long-running action state, retries, selection, and handling of stale or missing output.
- Planned paths. BackgroundWork.tsx, WorkActivity.tsx, activity-output.ts, WorkObjects.tsx
- Original session. 2026-11-24T22:42:04.216Z to 2026-11-24T22:44:36.292Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/AGENTS.md)
- [apps/web/src/BackgroundWork.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/BackgroundWork.tsx)
- [apps/web/src/WorkActivity.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkActivity.tsx)
- [apps/web/src/WorkObjects.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkObjects.tsx)
- [apps/web/src/WorkbenchActivity.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkbenchActivity.tsx)
- [apps/web/src/activity-output.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/activity-output.ts)
- [apps/web/src/api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/api.ts)
- [packages/core/background-work.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/background-work.ts)
- [packages/core/service.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/service.ts)
- [packages/core/source-workbench.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/source-workbench.ts)
- [tests/activity-output-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/activity-output-v3.test.ts)
- [tests/background-work-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/background-work-v3.test.ts)

Shareable finding dispositions.

- **A11.1 · P2** Refreshing output replaces the transcript with only the incremental page and can falsely report that no output exists. The renderer replaces its accumulated output with the cursor delta. The existing host test explicitly asserts an empty string for a read at end-of-output, which the renderer converts to “no output yet”. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/BackgroundWork.tsx#L168)
- **A11.2 · P2** A mutation during an in-flight background refresh can leave the drawer stuck at pre-action state. Refresh coalescing returns the pre-existing fetch and its finally clears the flight without recording a trailing read. The result requires late delivery of a pre-action view; a later unrelated event can heal it. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/BackgroundWork.tsx#L282)

### A12

**Runtime and model selection** · devin-local-879bbe

- Scope. Check model invalidation, runtime refresh, credential status changes, and disabled-state semantics.
- Planned paths. ModelPicker.tsx, runtime-presentation.ts, account-login-monitor.ts
- Original session. 2026-11-24T22:42:14.223Z to 2026-11-24T22:51:38.240Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/web/src/Connections.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/Connections.tsx)
- [apps/web/src/ContextInspector.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ContextInspector.tsx)
- [apps/web/src/ModelPicker.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ModelPicker.tsx)
- [apps/web/src/ScopedConversationComposer.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ScopedConversationComposer.tsx)
- [apps/web/src/account-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/account-api.ts)
- [apps/web/src/account-login-monitor.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/account-login-monitor.ts)
- [apps/web/src/runtime-presentation.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/runtime-presentation.ts)
- [packages/runtime-official/gemini.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/runtime-official/gemini.ts)
- [tests/account-login-monitor.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/account-login-monitor.test.ts)
- [tests/e2e/model-picker.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/model-picker.spec.ts)
- [tests/runtime-router.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/runtime-router.test.ts)
- [tests/thinking-level.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/thinking-level.test.ts)

Shareable finding dispositions.

- **A12.1 · P3** Gemini compaction is unconditionally disabled in the UI despite runtime support for advertised /compress sessions. The UI unconditionally denies Gemini compaction, while its adapter has a session capability check and handles advertised /compress. Confirm visibility policy and runtime capability plumbing before changing the UI. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/runtime-presentation.ts#L11)

### A13

**Connection and account screens** · devin-local-a8f2d3

- Scope. Check pending/committed state, cancellation, disconnect, and recovery UX across account flows.
- Planned paths. Connections.tsx, CredentialEntry.tsx, GitHubSignIn.tsx, IntegrationSettings.tsx, IntegrationSecretReferences.tsx, account-api.ts
- Original session. 2026-11-24T22:44:39.426Z to 2026-11-24T22:49:49.069Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/web/src/Artifact.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/Artifact.tsx)
- [apps/web/src/Connections.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/Connections.tsx)
- [apps/web/src/CredentialEntry.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/CredentialEntry.tsx)
- [apps/web/src/EverydayData.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/EverydayData.tsx)
- [apps/web/src/GitHubSignIn.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/GitHubSignIn.tsx)
- [apps/web/src/IntegrationSecretReferences.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/IntegrationSecretReferences.tsx)
- [apps/web/src/IntegrationSettings.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/IntegrationSettings.tsx)
- [apps/web/src/WorkspaceSurfaceBody.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceSurfaceBody.tsx)
- [apps/web/src/account-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/account-api.ts)
- [apps/web/src/account-login-monitor.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/account-login-monitor.ts)
- [apps/web/src/api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/api.ts)
- [apps/web/src/secure-artifact-context.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/secure-artifact-context.tsx)
- [apps/web/src/settings-operations.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/settings-operations.ts)
- [tests/e2e/settings-leaf-selects.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/settings-leaf-selects.spec.ts)
- [tests/e2e/shared-panels.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/shared-panels.spec.ts)
- [tests/e2e/subscription-accounts.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/subscription-accounts.spec.ts)

Shareable finding dispositions.

- **A13.1 · P2** A visibility or expiry refresh can invalidate and hide an in-flight credential write. Credential mutation and free-running status refresh share the same sequence. The refresh invalidates the response and can clear its busy state before the write settles. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/CredentialEntry.tsx#L17) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1967)
- **A13.2 · P3** A successful integration command is reported as an update failure when its confirmation reload fails. The catch path covers both the command and the follow-up read, producing the same failure message for an applied command and a lost refresh. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/IntegrationSettings.tsx#L12) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1967)

### A14

**Environment and pairing UI** · devin-local-dc20e9

- Scope. Check environment/device refresh, stale state, and users' visibility into permission changes.
- Planned paths. EnvironmentSettings.tsx, PairedDevicesPanel.tsx, ControlConsentPanel.tsx
- Original session. 2026-11-24T22:45:19.476Z to 2026-11-24T22:52:57.816Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/web/src/ControlConsentPanel.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ControlConsentPanel.tsx)

Shareable finding dispositions.

- **A14.2 · P2** Control consent polling and Stop failures are swallowed, leaving stale permission state without recovery feedback. The active status remains in memory after poll failures, and a failed Stop operation has an empty catch. Showing stale permission state and omitting control errors is a separate UX and reliability failure. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ControlConsentPanel.tsx#L25)

### A15

**Settings state and inventory** · devin-local-e97654

- Scope. Check observable setting effects, pending mutations, errors, and navigation parity.
- Planned paths. Settings.tsx, CompactSettings.tsx, settings-data.ts, settings-inventory.ts, settings-operations.ts, settings-registry.ts
- Original session. 2026-11-24T22:47:34.677Z to 2026-11-24T22:51:45.973Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/web/src/AppearanceSettings.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/AppearanceSettings.tsx)
- [apps/web/src/CompactSettings.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/CompactSettings.tsx)
- [apps/web/src/Connections.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/Connections.tsx)
- [apps/web/src/Settings.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/Settings.tsx)
- [apps/web/src/appearance-draft.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/appearance-draft.ts)
- [apps/web/src/compact-settings-data.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/compact-settings-data.ts)
- [apps/web/src/editor-handoff.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/editor-handoff.ts)
- [apps/web/src/settings-data.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/settings-data.ts)
- [apps/web/src/settings-inventory.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/settings-inventory.ts)
- [apps/web/src/settings-operations.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/settings-operations.ts)
- [apps/web/src/settings-registry.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/settings-registry.ts)
- [packages/contracts/preferences.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/preferences.ts)
- [packages/core/service.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/service.ts)
- [tests/settings-search-filter.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/settings-search-filter.test.ts)
- [tests/shell-settings.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/shell-settings.test.ts)

Shareable finding dispositions.

- **A15.1 · P2** A successful settings write is reported as unsaved when the follow-up refresh fails. The server applies settings before the follow-up load and the same catch covers both failure stages. A13.2 is a parallel integration-setting instance of the same problem. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/Settings.tsx#L143) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1967)

### A16

**Appearance and reduced motion** · devin-local-18ccfd

- Scope. Check committed versus draft preferences and runtime reduced-motion changes.
- Planned paths. AppearanceSettings.tsx, appearance-draft.ts, useAppearance.ts, motion-policy.ts, motion-spring.ts
- Original session. 2026-11-24T22:48:29.778Z to 2026-11-24T22:52:13.857Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/AGENTS.md)
- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/AppearanceSettings.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/AppearanceSettings.tsx)
- [apps/web/src/Settings.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/Settings.tsx)
- [apps/web/src/WorkspaceHost.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceHost.tsx)
- [apps/web/src/appearance-draft.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/appearance-draft.ts)
- [apps/web/src/appearance.css](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/appearance.css)
- [apps/web/src/motion-policy.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/motion-policy.ts)
- [apps/web/src/motion-spring.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/motion-spring.ts)
- [apps/web/src/useAppearance.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/useAppearance.ts)
- [tests/appearance-draft.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/appearance-draft.test.ts)
- [tests/motion-policy.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/motion-policy.test.ts)
- [tests/preferences-appearance.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/preferences-appearance.test.ts)

Shareable finding dispositions.

- **A16.1 · P2** Reverted draft fields remain owned and can overwrite newer committed preferences. Changing a field back to its prior acknowledged value does not remove it from the edited set. When another owner changes the preference and the first view saves another field, the stale edited member is included. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/AppearanceSettings.tsx#L53) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1728)

### A17

**Desktop embedded browser renderer** · devin-local-a21283

- Scope. Check attach/detach, bounds update order, and renderer recovery after host reset.
- Planned paths. DesktopBrowser.tsx, browser-slot-bounds.ts, desktop-context.tsx
- Original session. 2026-11-24T22:48:59.823Z to 2026-11-24T22:56:27.989Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.
- Result recovery. CLI output began with a repeated partial fragment. The coordinator accepted the complete final JSON object and preserved the original output.

Reviewed source references included in the shareable record.

- [apps/desktop/browser-bounds.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/browser-bounds.ts)
- [apps/desktop/browser-lifecycle.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/browser-lifecycle.ts)
- [apps/desktop/browser-proxy.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/browser-proxy.ts)
- [apps/desktop/docked-browser.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/docked-browser.ts)
- [apps/desktop/main.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts)
- [apps/desktop/preload.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/preload.ts)
- [apps/desktop/window-policy.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/window-policy.ts)
- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/DesktopBrowser.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/DesktopBrowser.tsx)
- [apps/web/src/browser-slot-bounds.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/browser-slot-bounds.ts)
- [apps/web/src/desktop-context.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/desktop-context.tsx)
- [apps/web/src/workspace-canvas.css](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/workspace-canvas.css)
- [packages/desktop-contract/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/desktop-contract/index.ts)
- [tests/e2e/workspace-ui.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/workspace-ui.spec.ts)

Shareable finding dispositions.

- **A17.1 · P2** Multiple browser slots can concurrently own conflicting bounds for the same docked browser. The canvas and fixed dock can both mount the unkeyed Slot. The host accepts each source from the owning window and applies it to one view. Native compositor and pointer behavior were not tested. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/DesktopBrowser.tsx#L14) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1966)

### A18

**Native browser lifecycle** · devin-local-7d92b3

- Scope. Check lifecycle, ownership routing, disposal and duplicate-attach failure recovery.
- Planned paths. apps/desktop/browser-lifecycle.ts, browser-bounds.ts, docked-browser.ts, browser-proxy.ts
- Original session. 2026-11-24T22:49:00.044Z to 2026-11-24T22:54:14.664Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/desktop/browser-bounds.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/browser-bounds.ts)
- [apps/desktop/browser-lifecycle.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/browser-lifecycle.ts)
- [apps/desktop/browser-proxy.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/browser-proxy.ts)
- [apps/desktop/docked-browser.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/docked-browser.ts)
- [apps/desktop/layout-transaction.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/layout-transaction.ts)
- [apps/desktop/main.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts)
- [apps/desktop/window-policy.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/window-policy.ts)
- [apps/web/src/DesktopBrowser.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/DesktopBrowser.tsx)
- [apps/web/src/browser-slot-bounds.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/browser-slot-bounds.ts)
- [tests/browser-lifecycle-cleanup.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/browser-lifecycle-cleanup.test.ts)
- [tests/desktop-native.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/desktop-native.test.ts)
- [tests/docked-browser-open.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/docked-browser-open.test.ts)
- [tests/e2e/native-browser-bounds.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/native-browser-bounds.spec.ts)
- [tests/native-browser-bounds.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/native-browser-bounds.test.ts)
- [tests/workspace-native-browser.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/workspace-native-browser.test.ts)
- [tests/workspace-native-transaction.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/workspace-native-transaction.test.ts)

Shareable finding dispositions.

- **A18.1 · P2** moveBrowser transfers custody before native attachment succeeds. Ownership metadata is transferred before native attachment. The new-view attach path has rollback; the move path lacks the equivalent. Production native exceptions were not induced. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts#L143) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1966)
- **A18.2 · P2** Failed layout rollback leaks newly docked browser records. Rollback detaches newly created views; the ownerless registry sweep is after the awaited transaction and the catch path does not run it. Repeated failure can consume the bounded browser slots. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts#L218) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1966)

### A19

**Window layout and restoration** · devin-local-70a240

- Scope. Check local layout durability, display changes, aborted moves and stale placement.
- Planned paths. apps/desktop/display-layout.ts, layout-transaction.ts, window-policy.ts, persistence.ts
- Original session. 2026-11-24T22:49:04.834Z to 2026-11-24T22:52:11.190Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/desktop/display-layout.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/display-layout.ts)
- [apps/desktop/layout-transaction.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/layout-transaction.ts)
- [apps/desktop/main.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts)
- [apps/desktop/persistence.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/persistence.ts)
- [apps/desktop/window-policy.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/window-policy.ts)
- [packages/desktop-contract/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/desktop-contract/index.ts)
- [tests/desktop-display-layout.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/desktop-display-layout.test.ts)
- [tests/native-persistence.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/native-persistence.test.ts)
- [tests/workspace-native-transaction.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/workspace-native-transaction.test.ts)

Shareable finding dispositions.

- **A19.1 · P2** Layout state file is replaced non-atomically, so a torn write silently discards all saved window placement. The native saved-layout sidecar is overwritten directly and loadSaved treats malformed content as empty. This establishes local sidecar corruption risk; backend layout recovery may restore some placements. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts#L90)

### A20

**Native startup and update** · devin-local-14e471

- Scope. Check startup/relaunch/quit ordering, readiness, resource cleanup and error recovery.
- Planned paths. apps/desktop/main.ts, updater.ts, workspace-events.ts, DesktopEntry.tsx, UpdateControl.tsx
- Original session. 2026-11-24T22:49:49.876Z to 2026-11-24T22:54:02.308Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/AGENTS.md)
- [apps/desktop/backend-policy.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/backend-policy.ts)
- [apps/desktop/layout-transaction.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/layout-transaction.ts)
- [apps/desktop/main.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts)
- [apps/desktop/persistence.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/persistence.ts)
- [apps/desktop/updater.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/updater.ts)
- [apps/desktop/workspace-events.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/workspace-events.ts)
- [apps/web/src/DesktopEntry.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/DesktopEntry.tsx)
- [apps/web/src/UpdateControl.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/UpdateControl.tsx)
- [apps/web/src/desktop-context.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/desktop-context.tsx)
- [tests/desktop-restart-quit.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/desktop-restart-quit.test.ts)
- [tests/desktop-updater.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/desktop-updater.test.ts)

Shareable finding dispositions.

- **A20.1 · P2** A failed replacement backend is left unmanaged and automatic recovery stops. Replacement startup failure can leave the process assigned but outside activation and normal exit/retry handling. The ordinary restart path and failed-replacement path require separate fault fixtures. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts#L316) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1860)
- **A20.2 · P2** Unrelated layout errors falsify savedStateFlushed and block verified update installation. An existing layoutError initializes savedStateFlushed to false; later successful profile and layout writes never restore true. The update gate then declines installation. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts#L382)

### A21

**Floating workspaces** · devin-local-bc1e16

- Scope. Check ownership of bounds, pointer interruption, minimum geometry, and focus restoration.
- Planned paths. FloatingWindow.tsx, FloatingRail.tsx, floating-layout.ts, floating-order.ts, panel-geometry.ts
- Original session. 2026-11-24T22:51:40.054Z to 2026-11-24T22:57:42.076Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/FloatingRail.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/FloatingRail.tsx)
- [apps/web/src/FloatingWindow.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/FloatingWindow.tsx)
- [apps/web/src/SideChat.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/SideChat.tsx)
- [apps/web/src/floating-layout.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/floating-layout.ts)
- [apps/web/src/floating-order.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/floating-order.ts)
- [apps/web/src/floating-window.css](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/floating-window.css)
- [apps/web/src/panel-geometry.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/panel-geometry.ts)
- [apps/web/src/shell.css](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/shell.css)
- [packages/ui-shell/SummaryDock.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/ui-shell/SummaryDock.tsx)
- [tests/e2e/floating-windows.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/floating-windows.spec.ts)
- [tests/e2e/free-floating-fixture.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/free-floating-fixture.tsx)
- [tests/e2e/free-floating.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/free-floating.spec.ts)
- [tests/e2e/right-tools.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/right-tools.spec.ts)
- [tests/floating-layout.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/floating-layout.test.ts)

Shareable finding dispositions.

- **A21.1 · P2** Transient viewport clamps are persisted as the user's owned geometry. The viewport resize path avoids explicit persistence, then the layout-state effect writes the clamped layout anyway. A smaller viewport can therefore change restored geometry on reload. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/FloatingWindow.tsx#L51) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1966)
- **A21.2 · P2** Rail-released windows cannot win recency stacking outside the rail. The increasingly high child z-index remains within the rail stacking context. Its sibling floating windows are therefore ordered by the rail, not by the child recency value. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/FloatingWindow.tsx#L157) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1966)

### A22

**Split workspaces** · devin-local-acd8ba

- Scope. Check allocation and restoration across layout changes, stale actions and duplicate placements.
- Planned paths. WorkspaceSplitLayout.tsx, split-workspace-api.ts, split-workspace-profiles.ts, split-thread-placement.ts, split-tool-placement.ts
- Original session. 2026-11-24T22:51:50.052Z to 2026-11-24T23:00:34.431Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/WorkspaceSplitLayout.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceSplitLayout.tsx)
- [apps/web/src/conversation-placement.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/conversation-placement.ts)
- [apps/web/src/layout-profile.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/layout-profile.ts)
- [apps/web/src/split-thread-placement.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/split-thread-placement.ts)
- [apps/web/src/split-tool-placement.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/split-tool-placement.ts)
- [apps/web/src/split-workspace-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/split-workspace-api.ts)
- [apps/web/src/split-workspace-profiles.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/split-workspace-profiles.ts)
- [apps/web/src/workspace-integration.css](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/workspace-integration.css)
- [apps/web/src/workspace-split.css](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/workspace-split.css)
- [packages/contracts/split-workspace.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/split-workspace.ts)
- [packages/core/split-workspace-layout.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/split-workspace-layout.ts)
- [packages/core/split-workspace.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/split-workspace.ts)
- [packages/ui-shell/SummaryDock.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/ui-shell/SummaryDock.tsx)
- [packages/ui-shell/summary-dock.css](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/ui-shell/summary-dock.css)
- [tests/conversation-placement.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/conversation-placement.test.ts)
- [tests/split-thread-placement.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/split-thread-placement.test.ts)
- [tests/split-tool-placement.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/split-tool-placement.test.ts)
- [tests/split-workspace-layout.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/split-workspace-layout.test.ts)
- [tests/split-workspace-renderer.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/split-workspace-renderer.test.ts)
- [tests/split-workspace-repository.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/split-workspace-repository.test.ts)

Shareable finding dispositions.

- **A22.1 · P2** Interleaved float moves overwrite previously saved geometry. Read/write geometry uses a parent render snapshot. The child updates its own geometry and writes localStorage without forcing the parent callback to capture the first write. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx#L974) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1966)
- **A22.2 · P2** Beside-tool fit calculation measures the summary-dock container instead of the split workspace. The outer fit test includes space that SummaryLayout reserves for the dock. The actual inner pane can be smaller at the placement threshold. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx#L1004) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1966)
- **A22.3 · P2** Floating redock bypasses the busy/error boundary and can leave a stale visual placement after a failed command. The direct redock dispatch lacks the error and cleanup branch used by docked drag. A stale revision is a real host rejection. Validate resulting preview behavior in a browser fixture. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceSplitLayout.tsx#L70) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1966)

### A23

**Files and checkpoints** · devin-local-900f6e

- Scope. Check file-read cancellation, grants/selection refresh, and restore-confirmation semantics.
- Planned paths. files/, FileCheckpoints.tsx, file-checkpoint-api.ts
- Original session. 2026-11-24T22:52:15.100Z to 2026-11-24T22:56:36.911Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/web/src/FileCheckpoints.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/FileCheckpoints.tsx)
- [apps/web/src/WorkspaceSurfaceBody.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceSurfaceBody.tsx)
- [apps/web/src/api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/api.ts)
- [apps/web/src/file-checkpoint-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/file-checkpoint-api.ts)
- [apps/web/src/files/FilesView.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/files/FilesView.tsx)
- [apps/web/src/files/GrantedFiles.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/files/GrantedFiles.tsx)
- [apps/web/src/files/ProjectFiles.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/files/ProjectFiles.tsx)
- [apps/web/src/files/ProjectSearch.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/files/ProjectSearch.tsx)
- [apps/web/src/files/useFilesRead.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/files/useFilesRead.ts)
- [packages/workspace/checkpoints.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/workspace/checkpoints.ts)
- [tests/e2e/file-checkpoints-fixture.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/file-checkpoints-fixture.tsx)
- [tests/e2e/file-checkpoints.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/file-checkpoints.spec.ts)
- [tests/e2e/m08-restore-fixture.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/m08-restore-fixture.tsx)
- [tests/e2e/m08-restore-ui.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/m08-restore-ui.spec.ts)
- [tests/file-checkpoints.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/file-checkpoints.test.ts)
- [tests/files-read-commit-owner.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/files-read-commit-owner.test.ts)

Shareable finding dispositions.

- **A23.1 · P1** Restore responses include internal StoredRestorePlan fields that the strict client parser rejects. Real client parsers admitted clean control plan/apply payloads and rejected the same fixtures with root and results. Both routes return the service records while the service populates those keys. The full Windows fixture timed out; synthetic parser proof only. [Probe](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/file-checkpoint-api.ts#L95) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1953)
- **A23.2 · P2** History does not refresh after a restore, hiding the recovery checkpoint the UI tells users to use. Back clears the selected item without invalidating the history list, and apply only updates detail-local state. The pre-restore entry is present in the host but the loaded list can remain unchanged. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/FileCheckpoints.tsx#L74) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1953)

### A24

**Source workbench and editor handoff** · devin-local-e533f4

- Scope. Check selection/action durability across refresh, branch changes and external handoff.
- Planned paths. SourceWorkbench.tsx, SourceSelectionActions.tsx, editor-handoff.ts, code-review-workspace/
- Original session. 2026-11-24T22:52:15.316Z to 2026-11-24T22:56:50.793Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/AGENTS.md)
- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/SourceSelectionActions.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/SourceSelectionActions.tsx)
- [apps/web/src/SourceWorkbench.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/SourceWorkbench.tsx)
- [apps/web/src/code-review-workspace/CodeIntelligencePanel.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/code-review-workspace/CodeIntelligencePanel.tsx)
- [apps/web/src/editor-handoff.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/editor-handoff.ts)
- [apps/web/src/journal.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/journal.ts)
- [apps/web/src/workbench-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/workbench-api.ts)
- [apps/web/src/workbench-recovery.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/workbench-recovery.ts)
- [packages/contracts/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/index.ts)
- [packages/contracts/source-selection.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/source-selection.ts)
- [tests/editor-handoff.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/editor-handoff.test.ts)
- [tests/journal.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/journal.test.ts)
- [tests/source-workbench-host-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/source-workbench-host-v3.test.ts)
- [tests/workbench-recovery-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/workbench-recovery-v3.test.ts)

Shareable finding dispositions.

- **A24.1 · P2** Source-draft CAS edits have no write-ahead staging, leaving a hard-refresh commit gap. The CAS replacements have no synchronous staging, unlike normal writes. The persistence gap remains until transaction commit; timing of a real browser hard refresh was not tested. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/journal.ts#L172)
- **A24.2 · P3** Mounted workbench does not revalidate retained sources when the branch or backing revision changes. The effect refresh key lacks branch/backing revision, so warning state can stay stale after a backing source change. Host validation still rejects stale references. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/SourceWorkbench.tsx#L107)

### A25

**Workbench recovery and output** · devin-local-765e6a

- Scope. Check failed/disconnected runs, recovery thresholds, artifact output and selection custody.
- Planned paths. WorkbenchOutput.tsx, WorkbenchActivity.tsx, WorkbenchInputsPanel.tsx, workbench-recovery.ts, workbench-input-recovery.ts
- Original session. 2026-11-24T22:53:00.316Z to 2026-11-24T22:57:41.556Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/AGENTS.md)
- [apps/web/src/SourceWorkbench.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/SourceWorkbench.tsx)
- [apps/web/src/WorkbenchActivity.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkbenchActivity.tsx)
- [apps/web/src/WorkbenchInputsPanel.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkbenchInputsPanel.tsx)
- [apps/web/src/WorkbenchOutput.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkbenchOutput.tsx)
- [apps/web/src/activity-output.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/activity-output.ts)
- [apps/web/src/journal.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/journal.ts)
- [apps/web/src/workbench-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/workbench-api.ts)
- [apps/web/src/workbench-input-recovery.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/workbench-input-recovery.ts)
- [apps/web/src/workbench-recovery.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/workbench-recovery.ts)
- [apps/web/src/workbench-window.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/workbench-window.ts)
- [packages/contracts/source-selection.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/source-selection.ts)
- [tests/workbench-input-recovery-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/workbench-input-recovery-v3.test.ts)

Shareable finding dispositions.

- **A25.1 · P2** RUN output view custody is dropped or shadowed across view types. One shared timer can replace a pending save for a different view type. Selecting the latest entry by owner alone also misselects when a newer other type exists. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/SourceWorkbench.tsx#L82)
- **A25.3 · P3** Empty work activity enables full-result actions that send a contract-invalid empty messageIds array. When the known output state has no IDs, the readFull callback remains available and can submit an empty request to a nonempty contract. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkbenchActivity.tsx#L20)

### A26

**Artifacts and widgets** · devin-local-b7386d

- Scope. Check artifact snapshot ownership, unsaved changes, and compatibility for stored widget payloads.
- Planned paths. Artifact.tsx, ArtifactPresentation.tsx, artifact-state.ts, artifact-inputs.ts, Widget.tsx, packages/widgets
- Original session. 2026-11-24T22:54:05.275Z to 2026-11-24T22:59:27.592Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/web/src/Artifact.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/Artifact.tsx)
- [apps/web/src/ArtifactPresentation.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ArtifactPresentation.tsx)
- [apps/web/src/Widget.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/Widget.tsx)
- [apps/web/src/artifact-inputs.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/artifact-inputs.ts)
- [apps/web/src/artifact-state.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/artifact-state.ts)
- [apps/web/src/journal.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/journal.ts)
- [docs/integration-contract.md](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/docs/integration-contract.md)
- [packages/contracts/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/index.ts)
- [packages/core/service.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/service.ts)
- [packages/core/widgets.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/widgets.ts)
- [packages/widgets/README.md](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/widgets/README.md)
- [packages/widgets/document.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/widgets/document.ts)
- [packages/widgets/policy.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/widgets/policy.ts)
- [packages/widgets/theme.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/widgets/theme.ts)
- [packages/widgets/worker.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/widgets/worker.ts)
- [tests/widget-isolation.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/widget-isolation.test.ts)

Shareable finding dispositions.

- **A26.1 · P1** Live input or theme updates can overwrite uncheckpointed widget edits with the last checkpointed state. The widget init path overwrites mutable worker state with checkpointed values after input/theme updates. An app/browser fixture should exercise retaining a dirty field. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/Widget.tsx#L162) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1964)
- **A26.2 · P1** Recovered structured drafts are silently re-based onto newer host state, bypassing stale-revision protection. Exact rediscovery of prior frontend audit §1.1. Math.max rebases older saved values onto the newer revision before flush. Still present at this audit SHA. [Source, previously tracked](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/artifact-state.ts#L94) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1964)
- **A26.3 · P2** widget action.submit can store state that bypasses the widget stateSchema. The widget action validates the event but skips applying stateSchema to submitted state. The adjacent checkpoint path applies it, and widget initialization rejects incompatible persisted values. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/service.ts#L1484)

### A27

**Documents and PDF** · devin-local-b94827

- Scope. Check worker disposal, stale render results, document identity and unsupported-content errors.
- Planned paths. DocumentWindow.tsx, DocumentPreview.tsx, document-evidence.tsx, pdf-draft*.ts
- Original session. 2026-11-24T22:54:15.287Z to 2026-11-24T23:04:30.727Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/web/src/DocumentPreview.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/DocumentPreview.tsx)
- [apps/web/src/DocumentWindow.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/DocumentWindow.tsx)
- [apps/web/src/api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/api.ts)
- [apps/web/src/document-evidence.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/document-evidence.tsx)
- [apps/web/src/pdf-draft-protocol.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/pdf-draft-protocol.ts)
- [apps/web/src/pdf-draft.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/pdf-draft.ts)
- [apps/web/src/pdf-draft.worker.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/pdf-draft.worker.ts)
- [apps/web/src/registry.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/registry.tsx)
- [apps/web/src/signature-assets.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/signature-assets.tsx)
- [packages/contracts/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/index.ts)
- [packages/ui-catalog/document-export-evidence.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/ui-catalog/document-export-evidence.ts)
- [packages/ui-catalog/documents.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/ui-catalog/documents.ts)
- [tests/document-handoff.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/document-handoff.test.ts)
- [tests/e2e/document-preview.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/document-preview.spec.ts)
- [tests/e2e/document-window.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/document-window.spec.ts)

Shareable finding dispositions.

- **A27.1 · P2** Unsupported windowed documents direct users to a source action that is never exposed. The windowed branch offers Retry while directing the user to open the source. The resource link exists only in the bypassed embedded presentation. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/DocumentWindow.tsx#L81)
- **A27.2 · P3** Text-document download timeout is reported as a generic abort rather than a timeout. The timeout supplies no reason to AbortController, and the window displays the default abort message instead of identifying the timeout. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/DocumentWindow.tsx#L60)

### A28

**Visual annotation and signature** · devin-local-a704e4

- Scope. Check input commit/cancel semantics, pointer ownership, release on unmount, and stored asset durability.
- Planned paths. ImageCompare.tsx, SignaturePad.tsx, signature-assets.tsx
- Original session. 2026-11-24T22:54:32.039Z to 2026-11-24T23:00:07.132Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/Artifact.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/Artifact.tsx)
- [apps/web/src/ImageCompare.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ImageCompare.tsx)
- [apps/web/src/SignaturePad.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/SignaturePad.tsx)
- [apps/web/src/artifact-state.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/artifact-state.ts)
- [apps/web/src/desktop-context.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/desktop-context.tsx)
- [apps/web/src/document-preview.css](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/document-preview.css)
- [apps/web/src/image-compare.css](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/image-compare.css)
- [apps/web/src/journal.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/journal.ts)
- [apps/web/src/signature-assets.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/signature-assets.tsx)
- [packages/ui-catalog/signature-data.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/ui-catalog/signature-data.ts)
- [tests/e2e/document-preview.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/document-preview.spec.ts)
- [tests/e2e/image-compare.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/image-compare.spec.ts)
- [tests/e2e/signing-fidelity.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/signing-fidelity.spec.ts)

Shareable finding dispositions.

- **A28.1 · P1** Cleared auto-generated signatures resurrect after reload. Clear persists null and only a mount-local ref records the user intent. An auto-generation configuration still has the name inputs on the next mount. Browser reproduction is pending. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/SignaturePad.tsx#L70)
- **A28.2 · P2** Non-editable artifact copies can consume the shared signature upload journal. A held non-editable artifact still activates the signature asset provider. Replay clears its shared journal after store.set, while a non-editable artifact does not run its persistence path. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/signature-assets.tsx#L87) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1964)

### A29

**Local terminal UI** · devin-local-e0a84e

- Scope. Check terminal selection/read errors, row/ANSI handling, refresh and history semantics.
- Planned paths. TerminalBody.tsx, TerminalExcerpt.tsx, terminal-excerpts.ts
- Original session. 2026-11-24T22:54:32.062Z to 2026-11-24T23:02:12.224Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/web/src/TerminalBody.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/TerminalBody.tsx)
- [apps/web/src/TerminalExcerpt.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/TerminalExcerpt.tsx)
- [apps/web/src/WorkspacePanel.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspacePanel.tsx)
- [apps/web/src/WorkspaceSurfaceBody.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceSurfaceBody.tsx)
- [apps/web/src/agents-workspace/composer.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agents-workspace/composer.ts)
- [apps/web/src/terminal-excerpts.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/terminal-excerpts.ts)
- [packages/contracts/workspace.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/workspace.ts)
- [packages/core/workspace-layout.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/workspace-layout.ts)
- [packages/workspace/terminal.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/workspace/terminal.ts)
- [tests/e2e/fixtures/terminal-read.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/fixtures/terminal-read.tsx)
- [tests/e2e/terminal-excerpts-fixture.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/terminal-excerpts-fixture.tsx)
- [tests/e2e/terminal-excerpts.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/terminal-excerpts.spec.ts)
- [tests/e2e/terminal-read.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/terminal-read.spec.ts)
- [tests/terminal-excerpts.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/terminal-excerpts.test.ts)

Shareable finding dispositions.

- **A29.1 · P2** Resize is optimistic and fire-and-forget, so a failed or reordered resize leaves the PTY at stale dimensions. Local fit and asynchronous PTY dispatch have no ordering or retry boundary. Later successful polling can clear the error without retrying the lost resize. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/TerminalBody.tsx#L109)

### A30

**Planning and task rendering** · devin-local-3af74d

- Scope. Check terminal status precedence, progress and history consistency, rendering fallback and keyboard behavior.
- Planned paths. plan-timeline/, PlanStatus.tsx, PlanningQuestion.tsx, TaskDisclosure.tsx, TaskHistory.tsx, TaskTable*.tsx, task-status.tsx
- Original session. 2026-11-24T22:55:23.116Z to 2026-11-24T23:03:19.233Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/AGENTS.md)
- [apps/web/src/PlanStatus.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/PlanStatus.tsx)
- [apps/web/src/PlanningQuestion.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/PlanningQuestion.tsx)
- [apps/web/src/TaskDisclosure.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/TaskDisclosure.tsx)
- [apps/web/src/TaskHistory.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/TaskHistory.tsx)
- [apps/web/src/TaskTable.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/TaskTable.tsx)
- [apps/web/src/TaskTableControls.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/TaskTableControls.tsx)
- [apps/web/src/plan-timeline/ReadingPosition.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/plan-timeline/ReadingPosition.tsx)
- [apps/web/src/plan-timeline/TimelineRows.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/plan-timeline/TimelineRows.tsx)
- [apps/web/src/task-status.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/task-status.tsx)
- [packages/contracts/planning-question.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/planning-question.ts)
- [packages/contracts/planning.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/planning.ts)
- [packages/core/plan-timeline.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/plan-timeline.ts)
- [tests/plan-timeline-review-regressions.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/plan-timeline-review-regressions.test.ts)
- [tests/plan-timeline-ui.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/plan-timeline-ui.test.ts)
- [tests/plan-timeline.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/plan-timeline.test.ts)
- [tests/planning-question.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/planning-question.test.ts)
- [tests/task-interface.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/task-interface.test.ts)

Shareable finding dispositions.

- **A30.1 · P2** No-op scroll and tap gestures permanently detach live history follow. User-interaction handlers disable follow immediately. The only re-enable is scroll, which may not fire if the viewport did not move. This is the task-history surface, distinct from transcript Find. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/TaskHistory.tsx#L30) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1965)

### A31

**Project memory presentation** · devin-local-1c2c13

- Scope. Check screening/receipt ownership and presentation after restore/retry or project switches.
- Planned paths. ProjectMemoryReview.tsx, TaskMemory.tsx, project-memory-*.ts, useProjectMemoryPreparation.ts
- Original session. 2026-11-24T22:55:23.275Z to 2026-11-24T23:13:25.804Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.
- Result recovery. Devin retried transient provider disconnects; the original session eventually completed.

Reviewed source references included in the shareable record.

- [apps/server/project-memory-routes.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/server/project-memory-routes.ts)
- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/ContextInspector.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ContextInspector.tsx)
- [apps/web/src/ProjectMemoryReview.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ProjectMemoryReview.tsx)
- [apps/web/src/TaskMemory.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/TaskMemory.tsx)
- [apps/web/src/agents-workspace/composer.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/agents-workspace/composer.ts)
- [apps/web/src/journal.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/journal.ts)
- [apps/web/src/project-memory-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/project-memory-api.ts)
- [apps/web/src/project-memory-preparation.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/project-memory-preparation.ts)
- [apps/web/src/project-memory-request-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/project-memory-request-api.ts)
- [apps/web/src/useProjectMemoryPreparation.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/useProjectMemoryPreparation.ts)
- [packages/contracts/project-memory.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/project-memory.ts)
- [packages/core/project-memory.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/project-memory.ts)

Shareable finding dispositions.

- **A31.1 · P2** A successfully saved note draft can be resurrected as unsaved after a journal commit race or failure. A successful server save ignores a false journal CAS result. If the durable write had failed or still lacks that generation, the staged old draft remains recoverable, and mount accepts it without checking against the current host note revision. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/TaskMemory.tsx#L46) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1975)
- **A31.3 · P3** Memory exclusion buttons have identical accessible names. All item-local exclusion buttons expose the same accessible name, so users navigating via a button list cannot distinguish which memory they will exclude. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/ContextInspector.tsx#L349) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1975)

### A32

**Plugin presentation lifecycle** · devin-local-8dd2b1

- Scope. Check compatibility, mount/lifecycle recovery and missing-plugin presentation.
- Planned paths. PluginFrame.tsx, PluginFloatingWindow.tsx, plugin-frame-client.ts, plugin-runtime.tsx, plugin-validation-policy.ts
- Original session. 2026-11-24T22:55:23.428Z to 2026-11-24T23:00:43.962Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/desktop/main.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts)
- [apps/desktop/window-policy.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/window-policy.ts)
- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/DesktopEntry.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/DesktopEntry.tsx)
- [apps/web/src/PluginFloatingWindow.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/PluginFloatingWindow.tsx)
- [apps/web/src/PluginFrame.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/PluginFrame.tsx)
- [apps/web/src/desktop-context.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/desktop-context.tsx)
- [apps/web/src/plugin-frame-client.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/plugin-frame-client.ts)
- [apps/web/src/plugin-runtime.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/plugin-runtime.tsx)
- [apps/web/src/plugin-validation-policy.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/plugin-validation-policy.ts)
- [packages/desktop-contract/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/desktop-contract/index.ts)
- [packages/plugins/frame-protocol.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/plugins/frame-protocol.ts)
- [tests/plugin-journal.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/plugin-journal.test.ts)
- [tests/plugin-tools-dock.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/plugin-tools-dock.test.ts)
- [tests/plugin-validation-policy.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/plugin-validation-policy.test.ts)
- [tests/split-app-browser.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/split-app-browser.test.ts)

Shareable finding dispositions.

- **A32.1 · P2** Missing plug-in branch never marks the native window ready. The unavailable plugin branch cannot send ready and native windows start hidden. The native startup timer then destroys the window, so the rendered unavailable message cannot be seen. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/DesktopEntry.tsx#L32)
- **A32.2 · P2** Failed placement recovery blocks close even without unsaved placement writes. The handoff guard throws after a failed read independent of pending writes. The frame flush propagates it and native close can be cancelled. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/PluginFloatingWindow.tsx#L58)

### A33

**Event-to-renderer sync seam** · devin-local-bdb07e

- Scope. Check reconnect, replay, duplicate events, omitted fields and supported client state convergence.
- Planned paths. apps/server/event-stream.ts, apps/web/src/snapshot-events.ts, apps/web/src/api.ts, packages/contracts
- Original session. 2026-11-24T22:55:23.589Z to 2026-11-24T23:00:06.578Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [apps/server/event-stream.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/server/event-stream.ts)
- [apps/server/server.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/server/server.ts)
- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/App.tsx)
- [apps/web/src/api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/api.ts)
- [apps/web/src/snapshot-events.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/snapshot-events.ts)
- [apps/web/src/useAttention.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/useAttention.ts)
- [packages/contracts/accounts.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/accounts.ts)
- [packages/contracts/attention.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/attention.ts)
- [packages/contracts/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/index.ts)
- [packages/contracts/planning.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/planning.ts)
- [packages/contracts/research.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/research.ts)
- [packages/contracts/skills.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/skills.ts)
- [packages/core/attention.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/attention.ts)
- [packages/core/service.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/service.ts)
- [packages/storage/store.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/storage/store.ts)
- [tests/web-events-recovery.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/web-events-recovery.test.ts)

Shareable finding dispositions.

- **A33.1 · P2** Reconnect resync does not advance the SSE cursor, so already-snapshotted events replay as live state. Exact match to prior frontend reconnect replay observation; overlapping sequence-ordering work is already tracked, including PR #1995. Confirmed still present at the audit SHA. [Source, previously tracked](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/api.ts#L210) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1965)
- **A33.2 · P3** runtime.context.budget carries usage but is omitted from the incremental renderer projection. The budget event has the same data needed by the usage fast path but falls through to structural refetch. This is a source-verified extra read, with no performance timing claimed. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/snapshot-events.ts#L21) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1969)

### A34

**Desktop preload-to-server seam** · devin-local-0c0f5a

- Scope. Check contract parity, error mapping, outstanding action resolution, and platform fallbacks.
- Planned paths. apps/desktop/preload.ts, apps/server/desktop-controls.ts, apps/web/src/workspace-native.ts, packages/desktop-contract
- Original session. 2026-11-24T22:56:47.835Z to 2026-11-24T23:00:51.172Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/AGENTS.md)
- [apps/desktop/attention-popups.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/attention-popups.ts)
- [apps/desktop/layout-transaction.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/layout-transaction.ts)
- [apps/desktop/main.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts)
- [apps/desktop/preload.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/preload.ts)
- [apps/desktop/window-policy.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/window-policy.ts)
- [apps/server/desktop-controls.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/server/desktop-controls.ts)
- [apps/server/main.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/server/main.ts)
- [apps/web/src/WorkspaceControls.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceControls.tsx)
- [apps/web/src/workspace-native.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/workspace-native.ts)
- [packages/contracts/workspace.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/contracts/workspace.ts)
- [packages/desktop-contract/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/desktop-contract/index.ts)
- [tests/desktop-host-controls.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/desktop-host-controls.test.ts)
- [tests/workspace-native-panels.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/workspace-native-panels.test.ts)
- [tests/workspace-native-transaction.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/workspace-native-transaction.test.ts)

Shareable finding dispositions.

- **A34.1 · P2** Project-context and task-plan panels collapse into the same native surface identity. The distinct thread-bound panel bindings resolve to one native surface key and openSurface reuses that key. Exact separate context/plan product behavior wasn’t seen in the detach acceptance. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/workspace-native.ts#L8) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/579)

### A35

**Browser regression coverage** · devin-local-b8c1d9

- Scope. Look for false passes, divergent fixtures and missing negative assertions in the highest-impact workflows. Cite exact gaps.
- Planned paths. tests/e2e, playwright.config.ts, tests/fixtures
- Original session. 2026-11-24T22:56:48.044Z to 2026-11-24T23:03:39.479Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.
- Result recovery. CLI output began with a repeated partial fragment. The coordinator accepted the complete final JSON object and preserved the original output.

Reviewed source references included in the shareable record.

- [apps/web/src/SkillLibrary.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/SkillLibrary.tsx)
- [apps/web/src/WorkspacePanel.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspacePanel.tsx)
- [apps/web/src/WorkspaceSurfaceBody.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/WorkspaceSurfaceBody.tsx)
- [apps/web/src/api.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/api.ts)
- [playwright.config.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/playwright.config.ts)
- [tests/e2e/app-ready.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/app-ready.ts)
- [tests/e2e/settle.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/settle.ts)
- [tests/e2e/skills.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/skills.spec.ts)
- [tests/e2e/task-interface-fixture.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/task-interface-fixture.ts)
- [tests/e2e/usage-context-fixture.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/usage-context-fixture.tsx)
- [tests/e2e/vite.config.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/vite.config.ts)
- [tests/e2e/wo8-pairing-fixture.tsx](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/wo8-pairing-fixture.tsx)
- [tests/e2e/wo8.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/wo8.spec.ts)
- [tests/fixtures/deferred.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/fixtures/deferred.ts)
- [tests/fixtures/owned-context7.mjs](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/fixtures/owned-context7.mjs)
- [tests/fixtures/pi-trace-table.md](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/fixtures/pi-trace-table.md)
- [tests/fixtures/secret-codec.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/fixtures/secret-codec.ts)
- [tests/fixtures/temp-dir.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/fixtures/temp-dir.ts)

Shareable finding dispositions.

- **A35.1 · P2** Create-skill proposal approval is unverified and the fixture applies it to the wrong skill. The creation scenario changes the requested name but the fixture saves its hard-coded existing skill. The test still passes when only proposal disappearance is observed. This is a coverage defect, not a demonstrated production failure. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/skills.spec.ts#L30) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1971)
- **A35.2 · P3** WO8 width and overflow assertions are pinned to an artificial fixture shell rather than the production artifact layout. The asserted container widths are fixed by the fixture shell and do not exercise the real embedded artifact container. Scope this to the particular test and add a production-path check if needed. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/e2e/wo8.spec.ts#L82) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1971)

### A36

**Release and packaged-verification evidence** · devin-local-bcf770

- Scope. Check whether test and packaging gates actually prove supported desktop workflows; flag specific coverage gaps and misreporting.
- Planned paths. scripts/rc-review, .github/workflows, apps/desktop/README.md, CONTRIBUTING.md
- Original session. 2026-11-24T22:56:48.251Z to 2026-11-24T22:59:31.295Z (UTC).
- Verification. Devin CLI resolved `swe-2-1-max`, the session export identified SWE-2.1 Max, and the process exited 0. The structured source-review result was accepted at the audited SHA.
- Release receipt. `OWNER=NONE`; received and recorded by the coordinator on behalf of the worker.

Reviewed source references included in the shareable record.

- [.github/workflows/ci.yml](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/.github/workflows/ci.yml)
- [.github/workflows/docs-links.yml](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/.github/workflows/docs-links.yml)
- [.github/workflows/m01-m03-audit.yml](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/.github/workflows/m01-m03-audit.yml)
- [.github/workflows/m15-evidence.yml](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/.github/workflows/m15-evidence.yml)
- [.github/workflows/release.yml](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/.github/workflows/release.yml)
- [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/CONTRIBUTING.md)
- [apps/desktop/README.md](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/README.md)
- [apps/desktop/main.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts)
- [apps/desktop/updater.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/updater.ts)
- [docs/releasing.md](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/docs/releasing.md)
- [package.json](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/package.json)
- [scripts/desktop-assets.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/scripts/desktop-assets.ts)
- [scripts/package-desktop.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/scripts/package-desktop.ts)
- [scripts/rc-review/build-candidate.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/scripts/rc-review/build-candidate.ts)
- [scripts/rc-review/common.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/scripts/rc-review/common.ts)
- [scripts/rc-review/flags-off.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/scripts/rc-review/flags-off.ts)
- [scripts/rc-review/run-rc-review.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/scripts/rc-review/run-rc-review.ts)
- [scripts/rc-review/upgrade-check.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/scripts/rc-review/upgrade-check.ts)
- [scripts/verify-installed-desktop.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/scripts/verify-installed-desktop.ts)
- [scripts/verify-readiness.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/scripts/verify-readiness.ts)
- [tests/release-workflow.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/tests/release-workflow.test.ts)

Shareable finding dispositions.

- **A36.1 · P2** Release uploads a differential installer whose exact bits were never installed or launched by the verification gate. The release job creates distinct differential bytes from the CI-installed non-differential artifact. Verified workflow coverage gap only. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/.github/workflows/release.yml#L138) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1974)
- **A36.2 · P2** The published updater feed is not backed by an automated packaged-upgrade verification lane. Installed CI validates fresh installs and the upgrade script is outside the automated workflow. The release repository contains no automated active-updater upgrade gate in the inspected paths. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/.github/workflows/release.yml#L153) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1974)
- **A36.3 · P2** Interrupted-setup recovery can report success after only a version-and-launch check, without proving seeded user state survived. The interrupted-setup receipt checks version and launch without verifying the seeded profile state, while the ordinary upgrade path checks both. [Source](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/scripts/rc-review/run-rc-review.ts#L43) · [Existing issue or adjacent work](https://github.com/skytuhua-org/Gen-V1/issues/1974)
