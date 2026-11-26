# Streaming phase baseline evidence

Plan: `PARALLEL-RENDERERS-R1/STR01`; issue: [#2285](https://github.com/skytuhua-org/Gen-V1/issues/2285).
Control source: `main@e22e1152d3ac85b13429492b3bbae4be5d02c856`.
Evidence date: 2026-11-26. Fixture content is synthetic and deterministic; no model inference or private data.

## Executed source inspection

Commands were run from the repository root on Windows with Node 24 and the existing checkout:

```text
git grep -n -E 'assistant\.delta|assistant\.message|onWorkspaceChanged' -- apps packages tests
git grep -n -E 'interface Message|type Message|messageSchema|workspaceChanged|publish\(' -- packages apps/server apps/desktop
git grep -n 'applyRuntimeEvent\|subscribe(' apps/web/src
```

Results relevant to authority:

- `packages/contracts/index.ts` defines `Message` with `id`, `threadId`, `role`, `content`, `createdAt`, `runId` and optional source/send metadata. It has no streaming, completion, phase or revision field.
- `packages/core/service.ts` accepts `assistant.delta` only for the current `threadId/runId/epoch`, buffers chunks, and writes a projected `Message`. `assistant.message` writes the same `Message` shape. The event payload returned to workspace subscribers contains `{runId,message}` in both cases.
- `apps/web/src/snapshot-events.ts` handles `runtime.assistant.delta`, `runtime.assistant.message` and `runtime.activity` through the same message-upsert branch. The branch does not retain which runtime kind produced the upsert.
- `apps/web/src/App.tsx` applies a patched snapshot when `applyRuntimeEvent` succeeds and otherwise refreshes the snapshot.
- Browser `apps/web/src/api.ts` consumes SSE events and calls `accept(event)`. When `window.harnessDesktop.onWorkspaceChanged` exists, the same function instead registers the native invalidation listener, refreshes snapshots and never calls `accept(event)`.
- `apps/desktop/workspace-events.ts` deliberately reads only SSE `id` sequence numbers and relays `{connected,sequence}`. Its comment states that renderers refresh the current snapshot and do not consume each event.
- `apps/desktop/preload.ts` exposes only `onWorkspaceChanged` values shaped as `{connected,sequence}`.
- The real host fixture can publish service-owned runtime events. Existing native browser fixtures generally stub `onWorkspaceChanged`; they do not establish production native per-message semantics.

## Executed actual-app baseline

A temporary probe spec used the production App, real local host, HTTP cookies/SSE, Service projection and `tests/host-fixture.ts` runtime ownership. No route interception, mocked EventSource or mirrored state machine was used. The probe was removed after execution because this discovery leaf owns documentation only; its full body is reproduced below.

```ts
import {test,expect,openHost,sendFixture} from '../host-fixture.ts';

test('streaming baseline keeps partial and final malformed markdown literal',async({page,host})=>{
 await openHost(page);await sendFixture(page,'document');
 host.runtime.event('assistant.delta',{messageId:'streaming-phase-bold',delta:'Probe partial **bold'});
 await expect(page.getByText('Probe partial **bold',{exact:true})).toBeVisible();
 expect(await page.locator('strong').filter({hasText:'bold'}).count()).toBe(0);
 host.runtime.event('assistant.delta',{messageId:'streaming-phase-code',delta:'Probe partial `code'});
 await expect(page.getByText('Probe partial `code',{exact:true})).toBeVisible();
 expect(await page.locator('code').filter({hasText:'code'}).count()).toBe(0);
 host.runtime.event('assistant.message',{messageId:'streaming-phase-final',content:'Probe final **malformed'});
 await expect(page.getByText('Probe final **malformed',{exact:true})).toBeVisible();
 expect(await page.locator('strong').filter({hasText:'malformed'}).count()).toBe(0);
});
```

Executed command:

```text
GEN_TEST_CHROMIUM_EXECUTABLE='C:/Users/Administrator/AppData/Local/ms-playwright/chromium_headless_shell-1194/chrome-win/headless_shell.exe' ./node_modules/.bin/playwright test --config tests/e2e/streaming-phase-probe.playwright.config.ts --reporter=line
```

Result: PASS, 1/1 test in 8.1 seconds, using bundled Chromium headless shell because direct Edge launch is unreliable on this Windows VM. This was an actual Chromium browser against the actual local host. It is not a Windows packaged-desktop/native-transport result and is not a performance measurement.

Observed baseline semantics:

| Probe | Runtime event kind | Visible canonical text | Semantic DOM |
|---|---|---|---|
| unfinished bold | `assistant.delta` | `Probe partial **bold` | no `strong` containing `bold`; marker remains literal |
| unfinished code | `assistant.delta` | ``Probe partial `code`` | no `code` containing `code`; marker remains literal |
| final malformed bold | `assistant.message` | `Probe final **malformed` | no `strong` containing `malformed`; marker remains literal |

The probe proves the current renderer leaves unsupported partial/final malformed source literal. It does **not** prove that the app can distinguish a provisional message from a final one: all three rows render through the same projected `Message` shape with no phase metadata.

## Baseline conclusion

The browser event stream originally carries distinct workspace event types (`runtime.assistant.delta` and `runtime.assistant.message`), but the authoritative host projection and snapshot reader erase that distinction before presentation. Native invalidation carries even less information: only connectivity and sequence. Animation, arrival order, matching `runId`, running-thread status, text growth, elapsed time or a false/default field therefore cannot truthfully identify an individual provisional assistant message.

This baseline supports the DEFER decision in `docs/agent-plans/streaming-phase-contract.md`. It is not evidence for adopting streaming Markdown repair.
