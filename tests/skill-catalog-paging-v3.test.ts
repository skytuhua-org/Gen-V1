import { expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SkillCatalogRepository, catalogHash, catalogItem, personalScope, type CatalogInventory, type SkillCatalogCapabilityProvider } from "../packages/skill-catalog/repository.ts";
import { harnessCatalog } from "../packages/skill-catalog/adapters.ts";
import { Store } from "../packages/storage/store.ts";
import { applySkillOperations } from "../packages/core/skills.ts";

// Reuse is safe only when the provider can prove that its inventory and
// authority have not changed. Unversioned providers must always be read live.
const source = (label: string) => ({ id: "s:" + label, kind: "personal" as const, label, availability: { status: "available" as const } });
const item = (label: string, key: string) => catalogItem("s:" + label, key, { name: key, description: "d" }, { kind: "filesystem", files: [{ path: `${key}/SKILL.md`, bytes: 1, digest: catalogHash(key) }], binding: "b" });

const ordered = (label: string, keys: string[]) => keys.map((key) => "s:" + label + ":" + catalogHash(key)).sort();

const counting = (label: string, keys: string[]) => {
  const state = { reads: 0, keys };
  const provider: SkillCatalogCapabilityProvider & { cacheRevision(): string } = {
    scope: personalScope,
    cacheRevision: () => JSON.stringify(state.keys),
    async read(): Promise<CatalogInventory> {
      state.reads++;
      return { sources: [source(label)], items: state.keys.map((key) => item(label, key)) };
    },
  };
  return { state, provider };
};

it("sequential pages share one inventory scan while the provider revision is unchanged", async () => {
  const a = counting("a", ["a1", "a2", "a3", "a4", "a5"]);
  const catalog = new SkillCatalogRepository([a.provider]);
  let page = await catalog.list({ limit: 2 });
  const seen = [...page.skills.map((entry) => entry.id)];
  while (page.nextCursor) {
    page = await catalog.list({ limit: 2, cursor: page.nextCursor });
    seen.push(...page.skills.map((entry) => entry.id));
  }
  expect(seen).toEqual(ordered("a", ["a1", "a2", "a3", "a4", "a5"]));
  // Pre-fix this is one scan per page (3); after repair it is one.
  expect(a.state.reads).toBe(1);
});

it("a reference lookup reuses inventory only while its provider revision is unchanged", async () => {
  const a = counting("a", ["a1", "a2"]);
  const catalog = new SkillCatalogRepository([a.provider]);
  const page = await catalog.list({});
  const ref = page.skills[0]!.ref!;
  const custody = await catalog.checkReference(ref);
  expect(custody.files.length).toBe(1);
  expect(a.state.reads).toBe(1);
  a.state.keys = [];
  await expect(catalog.checkReference(ref)).rejects.toMatchObject({ code: "SKILL_CATALOG_CHANGED" });
});

it("a cursor rejects a changed provider revision instead of serving retained stale entries", async () => {
  const a = counting("a", ["a1", "a2", "a3"]);
  const catalog = new SkillCatalogRepository([a.provider]);
  const first = await catalog.list({ limit: 2 });
  a.state.keys = ["a1", "a2", "a3", "a4"];
  await expect(catalog.list({ limit: 2, cursor: first.nextCursor! })).rejects.toMatchObject({ code: "SKILL_CATALOG_CHANGED" });
  expect((await catalog.list({ limit: 2 })).inventoryRevision).not.toBe(first.inventoryRevision);
});

it("stale revisions still fail once their snapshot is gone", async () => {
  const a = counting("a", ["a1", "a2", "a3"]);
  const catalog = new SkillCatalogRepository([a.provider], personalScope, { inventoryTtlMs: 0, inventoryCacheSize: 0 });
  const first = await catalog.list({ limit: 2 });
  a.state.keys = ["a1", "a2", "a4"];
  await expect(catalog.list({ limit: 2, cursor: first.nextCursor! })).rejects.toThrowError(/changed|SKILL_CATALOG_CHANGED/i);
});

it("an unavailable provider stays isolated from the page", async () => {
  const a = counting("a", ["a1"]);
  const down: SkillCatalogCapabilityProvider = { scope: personalScope, async read() { return { sources: [{ id: "s:down", kind: "personal", label: "down", availability: { status: "unavailable", reason: "disconnected" } }], items: [] }; } };
  const catalog = new SkillCatalogRepository([a.provider, down]);
  const page = await catalog.list({});
  expect(page.skills.length).toBe(1);
  expect(page.sources.find((s) => s.id === "s:down")?.availability.status).toBe("unavailable");
});

it("refreshes unversioned providers before first pages, references and cursor continuations", async () => {
  const a = counting("a", ["a1", "a2", "a3"]);
  const catalog = new SkillCatalogRepository([{ scope: personalScope, read: a.provider.read }]);
  const first = await catalog.list({ limit: 2 });
  a.state.keys = [];
  expect((await catalog.list({ limit: 2 })).skills).toEqual([]);
  await expect(catalog.checkReference(first.skills[0].ref!, { limit: 2 })).rejects.toMatchObject({ code: "SKILL_CATALOG_CHANGED" });
  await expect(catalog.list({ limit: 2, cursor: first.nextCursor! })).rejects.toMatchObject({ code: "SKILL_CATALOG_CHANGED" });
});

it("keeps unversioned sources fresh while reusing an unchanged sibling provider", async () => {
  const a = counting("a", ["a1"]), b = counting("b", ["b1"]);
  const catalog = new SkillCatalogRepository([a.provider, { scope: personalScope, read: b.provider.read }]);
  const first = await catalog.list();
  b.state.keys = ["b2"];
  const second = await catalog.list();
  expect(second.skills.map(entry => entry.name)).toEqual(expect.arrayContaining(["a1", "b2"]));
  expect(second.inventoryRevision).not.toBe(first.inventoryRevision);
  expect(a.state.reads).toBe(1);
  expect(b.state.reads).toBe(2);
});

it("does not reuse a provider result when its revision changes during the read", async () => {
  const a = counting("a", ["a1"]);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const catalog = new SkillCatalogRepository([{ ...a.provider, async read() { const value = await a.provider.read({}); await gate; return value; } }]);
  const pending = catalog.list();
  a.state.keys = ["a2"];
  release();
  await expect(pending).rejects.toMatchObject({ code: "SKILL_CATALOG_CHANGED" });
  expect((await catalog.list()).skills.map(entry => entry.name)).toEqual(["a2"]);
});

it("shares concurrent scans only for the same provider revision and context", async () => {
  const a = counting("a", ["a1"]);
  const catalog = new SkillCatalogRepository([a.provider]);
  const [first, same] = await Promise.all([catalog.list({ threadId: "one" }), catalog.list({ threadId: "one" })]);
  expect(same).toEqual(first);
  expect(a.state.reads).toBe(1);
  await catalog.list({ threadId: "two" });
  expect(a.state.reads).toBe(2);
});

it("does not let a returned page rewrite cached provider metadata", async () => {
  const a = counting("a", ["a1"]);
  const catalog = new SkillCatalogRepository([a.provider]);
  const first = await catalog.list();
  first.skills[0].name = "replaced by caller";
  first.sources[0].label = "replaced by caller";
  const second = await catalog.list();
  expect(second.skills[0].name).toBe("a1");
  expect(second.sources[0].label).toBe("a");
});

it("reuses Harness inventory until a committed Store change and preserves it after rollback", async () => {
  const root = await mkdtemp(join(tmpdir(), "gen-catalog-revision-")), store = new Store(root);
  try {
    store.internal("test.create", null, () => applySkillOperations(store, [{ action: "create", name: "procedure", baseRevision: 0, description: "Procedure", content: "First" }], { kind: "user" }));
    const provider = harnessCatalog(store), read = provider.read;
    let reads = 0;
    provider.read = async context => { reads++; return read(context); };
    const catalog = new SkillCatalogRepository([provider]), first = (await catalog.list()).skills[0];
    await catalog.checkReference(first.ref!);
    expect(reads).toBe(1);
    store.internal("test.patch", null, () => applySkillOperations(store, [{ action: "patch", name: "procedure", baseRevision: 1, oldText: "First", newText: "Second" }], { kind: "user" }));
    const second = (await catalog.list()).skills[0];
    expect(second.ref?.digest).not.toBe(first.ref?.digest);
    await expect(catalog.checkReference(first.ref!)).rejects.toMatchObject({ code: "SKILL_CATALOG_CHANGED" });
    expect(reads).toBe(2);
    expect(() => store.internal("test.rollback", null, () => {
      applySkillOperations(store, [{ action: "patch", name: "procedure", baseRevision: 2, oldText: "Second", newText: "Discarded" }], { kind: "user" });
      throw Error("rollback fixture");
    })).toThrow("rollback fixture");
    expect((await catalog.list()).skills[0]).toEqual(second);
    expect(reads).toBe(2);
  } finally { store.close(); await rm(root, { recursive: true, force: true }); }
});
