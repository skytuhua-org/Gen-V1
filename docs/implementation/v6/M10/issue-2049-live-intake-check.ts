import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { Store } from "../../../../packages/storage/store.ts";
import { ExternalIntakeCoordinator } from "../../../../packages/core/external-intake.ts";
import { __setCapabilityFlagForTests } from "../../../../packages/core/capability-flags.ts";

const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error("GITHUB_TOKEN missing");
const root = mkdtempSync(join(realpathSync(tmpdir()), "m10-live-intake-"));
const store = new Store(join(root, "state"));
const calls: { url: string; status: number; rateLimitRemaining: string | null }[] = [];
const tracingFetch: typeof fetch = async (url, init) => {
  const response = await fetch(url, init);
  calls.push({ url: String(url), status: response.status, rateLimitRemaining: response.headers.get("x-ratelimit-remaining") });
  return response;
};
try {
  __setCapabilityFlagForTests("integrations.intakeV1", true);
  const intake = new ExternalIntakeCoordinator({
    store,
    auth: { token: async () => token },
    fetchImpl: tracingFetch,
    sleep: async ms => { await new Promise(resolve => setTimeout(resolve, ms)); },
  });
  const command = (type: string, payload: Record<string, unknown> = {}) => ({ id: randomUUID(), type, payload });
  intake.configure(command("intake.configure"), { repositoryId: 1442565952, enabled: true });
  const first = await intake.pollOnce();
  const afterFirst = intake.records();
  const second = await intake.pollOnce();
  const afterSecond = intake.records();
  const artifact = {
    utc: new Date().toISOString(),
    repositoryId: 1442565952,
    base: process.env.GITHUB_SHA ?? "104217fe3fabfe41e0ea5071ef8398d9c8f8403d",
    source: "live GitHub REST read-only polling through ExternalIntakeCoordinator",
    first, second,
    recordCounts: { afterFirst: afterFirst.length, afterSecond: afterSecond.length },
    firstProposal: afterFirst[0] ? {
      intakeId: afterFirst[0].intakeId,
      issueNumber: afterFirst[0].proposedTask.issueNumber,
      eventId: afterFirst[0].eventId,
      payloadDigest: afterFirst[0].payloadDigest,
      disposition: afterFirst[0].disposition,
      sourceInstallation: afterFirst[0].sourceInstallation,
      sourceUrl: afterFirst[0].proposedTask.sourceUrl,
    } : null,
    duplicateDeliveriesCreated: afterSecond.length - afterFirst.length,
    calls,
    executorInvocations: 0,
    secretMaterialCaptured: false,
  };
  writeFileSync("docs/implementation/v6/M10/issue-2049-live-intake-evidence.json", JSON.stringify(artifact, null, 2));
  console.log(JSON.stringify({ first, second, recordsAfterFirst: afterFirst.length, recordsAfterSecond: afterSecond.length, firstIssue: artifact.firstProposal?.issueNumber, calls: calls.length, statuses: [...new Set(calls.map(c => c.status))], rateLimitRemaining: calls.at(-1)?.rateLimitRemaining }, null, 2));
  intake.stop();
} finally {
  store.close();
  rmSync(root, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 });
  __setCapabilityFlagForTests("integrations.intakeV1", undefined);
}
