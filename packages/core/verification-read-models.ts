import {attestVerificationArtifacts} from './verification-artifacts.ts';
import type { Store } from '../storage/store.ts';
import type { Thread } from '../contracts/index.ts';
import type { ToolEffectRecord } from '../contracts/tool-effects.ts';
import type {
  CheckObservationV1, CompletionLabel, DeliverableAssessmentV1,
  VerificationDeclarationV1, VisualObservationV1,
} from '../contracts/verification.ts';
import { computeAssessment, observationFreshness, observationMatchesThreadOwner, SecurityFindingLedger } from './verification-gate.ts';
import { assertVerificationSourceRoot, readVerificationSourceCut } from './project-verification.ts';
import { createHash } from 'node:crypto';
import { closeSync, constants, fstatSync, openSync, readSync, realpathSync } from 'node:fs';
import { join, sep } from 'node:path';
import type { SecurityFindingV1 } from '../contracts/verification.ts';

/** M06 additive read model for the verification panel. Columns: requirement,
 * observed check, source revision, outcome, freshness, verifier and evidence.
 * A stale result is a result attached to a different source cut — it never
 * renders as a green badge, and the panel shows a Stale banner. */

export interface VerificationCheckDetails {
  argv: string[];
  cwdIdentity: string;
  codeDigest: string;
  dependencyDigest: string;
  recipeDigest: string;
  environmentId: string;
  startedAt: string;
  endedAt: string;
  exitCode: number | null;
  observationKind: CheckObservationV1['observationKind'];
  detail: string | null;
  visual: Pick<VisualObservationV1, 'checklistItemId' | 'actionTraceId' | 'origin' | 'viewport' | 'assertion' | 'observed' | 'screenshotDigest'> | null;
}

export interface VerificationPanelRow {
  requirement: string;
  checkId: string | null;
  check: string;
  phase: string | null;
  sourceRevision: string;
  outcome: string;
  freshness: 'CURRENT' | 'STALE' | 'INDETERMINATE' | null;
  verifier: string | null;
  evidence: string[];
  missing: string[];
  details?: VerificationCheckDetails;
}

/** M06 T03 bounded scoped security evidence. Findings are recorded advisory
 * observations — never executable reproductions and never a numeric severity
 * or confidence score. `sourceState` compares the recorded blob against the
 * live workspace file: CURRENT byte-identical, STALE edited since recording,
 * UNAVAILABLE missing/out-of-root/unreadable custody, INDETERMINATE when no
 * attested source root exists to compare against. */
export interface VerificationFindingRow {
  findingId: string;
  path: string;
  line: number | null;
  blobRevision: string;
  sourceState: 'CURRENT' | 'STALE' | 'UNAVAILABLE' | 'INDETERMINATE';
  authorizedScope: string;
  observation: string;
  impact: string;
  status: SecurityFindingV1['status'];
  reproductionRecorded: boolean;
  evidenceQuality: 'ADVISORY';
  updatedAt: string;
}

export interface VerificationPanelModel {
  label: CompletionLabel | null;
  staleBanner: boolean;
  summary: { verified: number; failed: number; unverified: number; blocked: number; missing: string[] };
  rows: VerificationPanelRow[];
  /** Bounded scoped findings for the current owner only. `omitted` counts
   * findings beyond the cap so the panel can say the list is truncated. */
  findings: { rows: VerificationFindingRow[]; omitted: number };
}

const short = (value: string) => (value.length > 12 ? value.slice(0, 12) : value);
const sourceBasis = ({rootPath, sourceFiles, dependencyFiles, environmentId}: VerificationDeclarationV1) =>
  JSON.stringify([rootPath, sourceFiles, dependencyFiles, environmentId]);

function checkDetails(obs: CheckObservationV1 | VisualObservationV1): VerificationCheckDetails {
  // Functional browser assertions also carry visual fields. Their recorded
  // kind must not hide the expected/observed behavior or tested viewport.
  const visual = 'checklistItemId' in obs ? {
    checklistItemId: obs.checklistItemId, actionTraceId: obs.actionTraceId, origin: obs.origin,
    viewport: {...obs.viewport}, assertion: obs.assertion, observed: obs.observed, screenshotDigest: obs.screenshotDigest,
  } : null;
  return {
    argv: [...obs.argv], cwdIdentity: obs.cwdIdentity, codeDigest: obs.codeDigest,
    dependencyDigest: obs.dependencyDigest, recipeDigest: obs.recipeDigest, environmentId: obs.environmentId,
    startedAt: obs.startedAt, endedAt: obs.endedAt, exitCode: obs.exitCode,
    observationKind: obs.observationKind, detail: obs.detail?.slice(0, 2000) ?? null, visual,
  };
}

const FINDINGS_CAP = 50;
const FINDING_FILE_BYTES = 4 * 1024 * 1024;

/** Git-style blob digest (`sha1("blob <len>\0" + bytes)`) of one root-relative
 * file, bounded and confined to the attested root. Null when the file cannot
 * be read as ordinary in-root custody. */
function findingBlobDigest(rootPath: string, relative: string): string | null {
  try {
    const base = realpathSync.native(rootPath);
    const candidate = realpathSync.native(join(base, ...relative.split('/')));
    if (candidate !== base && !candidate.startsWith(base + sep)) return null;
    const fd = openSync(candidate, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    try {
      const info = fstatSync(fd);
      if (!info.isFile() || info.size > FINDING_FILE_BYTES) return null;
      const body = Buffer.alloc(info.size);
      let offset = 0;
      while (offset < info.size) {
        const count = readSync(fd, body, offset, info.size - offset, null);
        if (count === 0) return null;
        offset += count;
      }
      const hash = createHash('sha1');
      hash.update(`blob ${info.size}\0`);
      hash.update(body);
      return hash.digest('hex');
    } finally { closeSync(fd); }
  } catch {
    return null;
  }
}

function findingRows(store: Store, threadId: string, rootPath: string | null): { rows: VerificationFindingRow[]; omitted: number } {
  const all = new SecurityFindingLedger(store).all(threadId)
    .slice()
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || b.updatedAt.localeCompare(a.updatedAt));
  const rows: VerificationFindingRow[] = [];
  for (const finding of all.slice(0, FINDINGS_CAP)) {
    let sourceState: VerificationFindingRow['sourceState'] = 'INDETERMINATE';
    if (rootPath) {
      const live = findingBlobDigest(rootPath, finding.source.path);
      sourceState = live === null ? 'UNAVAILABLE' : live === finding.source.blobSha ? 'CURRENT' : 'STALE';
    }
    rows.push({
      findingId: finding.findingId,
      path: finding.source.path,
      line: finding.source.line,
      blobRevision: finding.source.blobSha.slice(0, 12),
      sourceState,
      authorizedScope: finding.authorizedScope,
      observation: finding.observation,
      impact: finding.impact,
      status: finding.status,
      reproductionRecorded: finding.reproduction !== null,
      evidenceQuality: 'ADVISORY',
      updatedAt: finding.updatedAt,
    });
  }
  return { rows, omitted: Math.max(0, all.length - FINDINGS_CAP) };
}

export async function verificationPanelModel(store: Store, threadId: string, signal?: AbortSignal): Promise<VerificationPanelModel> {
  signal?.throwIfAborted();
  let declaration = store.get<VerificationDeclarationV1>('verificationDeclaration', threadId);
  // Re-digest the declared inputs on each read. A lost root, changed input
  // or changed declaration makes that cut indeterminate.
  let current: { codeDigest: string; dependencyDigest: string; environmentId: string } | null = null;
  if (declaration) {
    const basis = sourceBasis(declaration);
    try {
      const cut = await readVerificationSourceCut(store, threadId, declaration, signal);
      cut.assertCurrent();
      current = cut;
    } catch {
      signal?.throwIfAborted();
    }
    declaration = store.get<VerificationDeclarationV1>('verificationDeclaration', threadId);
    if (current && (!declaration || sourceBasis(declaration) !== basis)) current = null;
  }
  // Read the owner and evidence after the source I/O so in-flight state changes
  // are reflected in the returned projection.
  const thread = store.get<Thread>('thread', threadId);
  const assessments = store.all<DeliverableAssessmentV1>('assessment', threadId);
  const latest = assessments.at(-1) ?? null;
  const observations: (CheckObservationV1 | VisualObservationV1)[] = [
    ...store.all<CheckObservationV1>('checkObservation', threadId),
    ...store.all<VisualObservationV1>('visualObservation', threadId),
  ];
  const ownedObservations = observations.filter(observation => observationMatchesThreadOwner(observation, thread));
  // Completion snapshots cannot attest today's source or external effects.
  // Recompute the projection without rewriting any saved observation/assessment.
  const unresolvedEffects = store.all<ToolEffectRecord>('toolEffect', threadId)
    .filter(effect => !['SUCCEEDED', 'FAILED', 'CANCELLED', 'DENIED'].includes(effect.state))
    .map(effect => effect.invocationId);
  const recomputed = declaration || latest ? computeAssessment({
      threadId,
      sourceCut: {
        headSha: latest?.sourceCut.headSha ?? null,
        codeDigest: current?.codeDigest ?? '0'.repeat(64),
        dependencyDigest: current?.dependencyDigest ?? '0'.repeat(64),
        environmentId: declaration?.environmentId ?? latest!.sourceCut.environmentId,
      },
      requirements: declaration?.requirements ?? latest!.requirements,
      observations: ownedObservations,
      artifactAttestations: attestVerificationArtifacts(store, ownedObservations, declaration?.requirements ?? latest!.requirements),
      unresolvedEffects,
      verifierIdentity: latest?.verifierIdentity ?? 'verification-panel',
      provenance: 'read model recomputed against live source digests',
    }) : null;
  if (!current && recomputed) {
    // A fallback digest is serialization plumbing, never evidence that a live
    // source matches. Even a matching historical value cannot establish this.
    for (const requirement of recomputed.requirements) {
      if (requirement.assessment === 'VERIFIED') requirement.assessment = 'UNVERIFIED';
      requirement.missing = [...requirement.missing, declaration ? 'current source inputs are unavailable' : 'current verification declaration is unavailable'].slice(0, 64);
    }
    if (recomputed.label === 'VERIFIED') recomputed.label = 'COMPLETED_UNVERIFIED';
  }

  const matches = (obs: CheckObservationV1, ref: string) => obs.checkId === ref || obs.executionId === ref;
  const freshnessOf = (obs: CheckObservationV1) => (current && observationMatchesThreadOwner(obs, thread) ? observationFreshness(obs, current) : 'INDETERMINATE' as const);

  const rows: VerificationPanelRow[] = [];
  const assessed = new Map((recomputed?.requirements ?? latest?.requirements ?? []).map(req => [req.id, req]));
  if (declaration) {
    for (const req of declaration.requirements) {
      const bound = observations.filter(obs => req.checkRefs.some(ref => matches(obs, ref)));
      const state = assessed.get(req.id);
      const missingRefs = req.checkRefs.filter(ref => !ownedObservations.some(obs => matches(obs, ref)));
      for (const ref of missingRefs) rows.push({requirement: req.id, checkId: null, check: ref, phase: null, sourceRevision: '—', outcome: 'UNVERIFIED', freshness: null, verifier: null, evidence: [], missing: [`no current-owner observation bound to ${ref} for ${req.id}`]});
      if (!bound.length && !missingRefs.length) {
        rows.push({ requirement: req.id, checkId: null, check: '—', phase: null, sourceRevision: '—', outcome: 'UNVERIFIED', freshness: null, verifier: null, evidence: [], missing: state?.missing ?? [`no observation bound to ${req.id}`] });
        continue;
      }
      for (const obs of bound) {
        const freshness = freshnessOf(obs);
        rows.push({
          requirement: req.id, checkId: obs.checkId, check: obs.argv.join(' ').slice(0, 200), phase: obs.phase,
          sourceRevision: short(obs.codeDigest), outcome: obs.outcome,
          freshness, verifier: obs.executionId, evidence: [...obs.artifactRefs], missing: [], details: checkDetails(obs),
        });
      }
    }
  }
  // Observations not bound to any declared requirement still render — the
  // panel reports what was observed, never just what was claimed.
  const boundIds = new Set(rows.map(row => row.checkId));
  for (const obs of observations) {
    if (boundIds.has(obs.checkId)) continue;
    const freshness = freshnessOf(obs);
    rows.push({
      requirement: '—', checkId: obs.checkId, check: obs.argv.join(' ').slice(0, 200), phase: obs.phase,
      sourceRevision: short(obs.codeDigest), outcome: obs.outcome,
      freshness, verifier: obs.executionId, evidence: [...obs.artifactRefs], missing: [], details: checkDetails(obs),
    });
  }

  const counts = { verified: 0, failed: 0, unverified: 0, blocked: 0, missing: [] as string[] };
  for (const req of recomputed?.requirements ?? latest?.requirements ?? []) {
    if (req.assessment === 'VERIFIED') counts.verified += 1;
    else if (req.assessment === 'FAILED') counts.failed += 1;
    else if (req.assessment === 'BLOCKED') counts.blocked += 1;
    else counts.unverified += 1;
    counts.missing.push(...req.missing);
  }
  const staleBanner = rows.some(row => row.freshness === 'STALE');
  // A completion label exists only after a saved completion assessment — the
  // task_finish boundary. Before that the panel still recomputes requirement
  // rows and freshness against the live cut, but shows no label.
  // Scoped findings are current-owner evidence only. Freshness compares the
  // recorded blob against the live file under the attested declaration root;
  // without a root the comparison is indeterminate — never silently current.
  let findingRoot: string | null = null;
  if (declaration) {
    try {
      assertVerificationSourceRoot(store, threadId, declaration.rootPath);
      findingRoot = declaration.rootPath;
    } catch {
      findingRoot = null;
    }
  }
  return { label: latest ? (recomputed?.label ?? latest.label) : null, staleBanner, summary: counts, rows, findings: findingRows(store, threadId, findingRoot) };
}
