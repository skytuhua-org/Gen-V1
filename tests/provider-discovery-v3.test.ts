import { expect, it, vi } from "vitest";
import type { ModelInfo, RuntimeAdapter } from "../packages/contracts/index.ts";
import { createRuntime } from "../packages/runtime/index.ts";

// Two subscription providers share the pi adapter. One signing in must not
// suppress the healthy sibling's catalog.
const BUSY = "openai";
const HEALTHY = "xai";
const piCatalog: ModelInfo[] = [
  { id: `${BUSY}/m`, provider: BUSY, name: "busy" } as ModelInfo,
  { id: `${HEALTHY}/m`, provider: HEALTHY, name: "healthy" } as ModelInfo,
];
const officialCatalog: ModelInfo[] = [{ id: "claude-code/m", provider: "claude-code", name: "official" } as ModelInfo];

const fakeAdapter = (catalog: ModelInfo[]): RuntimeAdapter & { models: ReturnType<typeof vi.fn> } => ({
  configure: vi.fn(),
  models: vi.fn(async () => structuredClone(catalog)),
  start: vi.fn(async () => {}),
  followUp: vi.fn(async () => {}),
  cancel: vi.fn(async () => {}),
  compact: vi.fn(async () => {}),
  history: vi.fn(async () => []),
  dispose: vi.fn(async () => {}),
});

const fixture = (signingIn: (id: string) => boolean = (id) => id === BUSY) => {
  const pi = fakeAdapter(piCatalog), official = fakeAdapter(officialCatalog);
  const accounts = {
    get: () => undefined,
    isSigningIn: signingIn,
    claimUse: (providerId: string) => ({ id: `lease-${providerId}` }),
    releaseUse: vi.fn(),
  };
  const runtime = createRuntime({ dataDir: "mock-provider-discovery", accounts: accounts as never }, {
    pi: () => pi,
    official: () => official,
  });
  return { pi, official, accounts, runtime };
};

it("keeps a healthy sibling while another provider on the adapter signs in", async () => {
  const { runtime, pi } = fixture();
  const models = await runtime.models();
  // Pre-fix the whole adapter probe rejects on the busy provider's lease,
  // dropping the healthy sibling too.
  expect(models.map((model) => model.id)).toContain(`${HEALTHY}/m`);
  expect(models.map((model) => model.id)).not.toContain(`${BUSY}/m`);
  expect(models.map((model) => model.id)).toContain("claude-code/m");
  expect(pi.models).toHaveBeenCalledOnce();
});

it("still returns the healthy provider for an explicit query", async () => {
  const { runtime } = fixture();
  const models = await runtime.models({ providerId: HEALTHY });
  expect(models.map((model) => model.id)).toEqual([`${HEALTHY}/m`]);
});

it("keeps a distinct error for an explicit query to the signing-in provider", async () => {
  const { runtime } = fixture();
  await expect(runtime.models({ providerId: BUSY })).rejects.toMatchObject({ code: "AI_AUTH_REQUIRED" });
});

it("serves every provider when none is signing in", async () => {
  const { runtime } = fixture(() => false);
  const models = await runtime.models();
  expect(models.map((model) => model.id)).toEqual(expect.arrayContaining([`${BUSY}/m`, `${HEALTHY}/m`, "claude-code/m"]));
});
