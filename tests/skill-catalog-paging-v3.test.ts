import { expect, it } from "vitest";
import { SkillCatalogRepository, catalogHash, catalogItem, personalScope, type CatalogInventory, type SkillCatalogCapabilityProvider } from "../packages/skill-catalog/repository.ts";

// Audit baseline: one provider.read traversal (scan + rehash of every item)
// must not repeat for each page or reference lookup of the same unchanged
// catalog.
const source = (label: string) => ({ id: "s:" + label, kind: "personal" as const, label, availability: { status: "available" as const } });
const item = (label: string, key: string) => catalogItem("s:" + label, key, { name: key, description: "d" }, { kind: "filesystem", files: [{ path: `${key}/SKILL.md`, bytes: 1, digest: catalogHash(key) }], binding: "b" });

const ordered = (label: string, keys: string[]) => keys.map((key) => "s:" + label + ":" + catalogHash(key)).sort();

const counting = (label: string, keys: string[]) => {
  const state = { reads: 0, keys };
  const provider: SkillCatalogCapabilityProvider = {
    scope: personalScope,
    async read(): Promise<CatalogInventory> {
      state.reads++;
      return { sources: [source(label)], items: state.keys.map((key) => item(label, key)) };
    },
  };
  return { state, provider };
};

it("sequential pages share one inventory scan", async () => {
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

it("a reference lookup reuses the recent inventory", async () => {
  const a = counting("a", ["a1", "a2"]);
  const catalog = new SkillCatalogRepository([a.provider]);
  const page = await catalog.list({});
  const ref = page.skills[0]!.ref!;
  const custody = await catalog.checkReference(ref);
  expect(custody.files.length).toBe(1);
  expect(a.state.reads).toBe(1);
});

it("a cursor serves its pinned revision across a catalog change", async () => {
  const a = counting("a", ["a1", "a2", "a3"]);
  const catalog = new SkillCatalogRepository([a.provider]);
  const first = await catalog.list({ limit: 2 });
  a.state.keys = ["a1", "a2", "a3", "a4"];
  const second = await catalog.list({ limit: 2, cursor: first.nextCursor! });
  expect(second.inventoryRevision).toBe(first.inventoryRevision);
  expect(second.skills.map((entry) => entry.id)).toEqual(ordered("a", ["a1", "a2", "a3"]).slice(2));
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
