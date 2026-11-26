import { HarnessError } from '../contracts/index.ts';
import {
	AGENT_FILE_POLICY_DEFAULTS,
	AGENT_FILE_POLICY_LIMITS,
	FILE_POLICY_DENIED,
	FILE_POLICY_DENIED_MESSAGE,
	agentFilePolicySchema,
	parseAgentFilePolicyRules,
	type AgentFilePolicy,
} from '../contracts/agent-file-policy.ts';
import type { Store } from '../storage/store.ts';
import { compileFilePolicy, filePolicyDenies } from './file-policy.ts';

const kind = 'agentFilePolicy';
export const agentFilePolicyScopeSchema = (value: unknown): value is string =>
	typeof value === 'string' && (value === 'global' || /^project:[A-Za-z0-9:_.-]{1,200}$/.test(value));

export interface ResolvedAgentFilePolicy extends AgentFilePolicy {
	/** False when no record exists and the value is virtual (global defaults or empty project). */
	explicit: boolean;
}

/** An absent global record resolves to the shipped defaults at revision zero; an absent project record is empty. */
export function readAgentFilePolicy(store: Store, scope: string): ResolvedAgentFilePolicy {
	if (!agentFilePolicyScopeSchema(scope)) throw new HarnessError('INVALID_INPUT', 'Choose a global or project scope.');
	let stored: unknown;
	try {
		// Store.get uses null for both an absent row and persisted JSON null.
		// Only a genuinely absent row may resolve to the virtual policy.
		const row = store.db.prepare('SELECT body FROM entities WHERE kind=? AND id=?').get(kind, scope) as { body: string } | undefined;
		if (!row) return { revision: 0, rules: scope === 'global' ? [...AGENT_FILE_POLICY_DEFAULTS] : [], explicit: false };
		stored = JSON.parse(row.body);
	} catch { throw new HarnessError(FILE_POLICY_DENIED, FILE_POLICY_DENIED_MESSAGE); }
	const parsed = agentFilePolicySchema.safeParse(stored);
	if (!parsed.success) throw new HarnessError(FILE_POLICY_DENIED, FILE_POLICY_DENIED_MESSAGE);
	return { ...parsed.data, explicit: true };
}

/** Effective deny is the union of the global scope with every applicable project scope. */
export function resolvedAgentFilePolicy(store: Store, projectId: string | null | undefined): { global: AgentFilePolicy; project: AgentFilePolicy | null; revision: string } {
	const global = readAgentFilePolicy(store, 'global');
	const project = projectId ? readAgentFilePolicy(store, `project:${projectId}`) : null;
	return { global, project, revision: `${global.revision}/${project?.revision ?? 0}` };
}

export function saveAgentFilePolicy(store: Store, scope: string, baseRevision: number, rulesText: string): { scope: string; revision: number } {
	if (!agentFilePolicyScopeSchema(scope)) throw new HarnessError('INVALID_INPUT', 'Choose a global or project scope.');
	if (!Number.isSafeInteger(baseRevision) || baseRevision < 0) throw new HarnessError('INVALID_INPUT', 'Provide the current revision.');
	if (new TextEncoder().encode(rulesText).byteLength > AGENT_FILE_POLICY_LIMITS.rules * (AGENT_FILE_POLICY_LIMITS.ruleBytes + 1) * 2)
		throw new HarnessError('INVALID_INPUT', 'Rule text exceeds the supported size.');
	const { rules, errors } = parseAgentFilePolicyRules(rulesText);
	if (errors.length > 0) throw new HarnessError('INVALID_INPUT', 'Fix the highlighted rules before saving.', errors);
	return store.internal('agentFilePolicy.save', null, (): { scope: string; revision: number } => {
		const { revision } = readAgentFilePolicy(store, scope);
		if (revision !== baseRevision) throw new HarnessError('AGENT_FILE_POLICY_CHANGED', 'File rules changed. Reload before saving.');
		if (revision === Number.MAX_SAFE_INTEGER) throw new HarnessError('INVALID_INPUT', 'File rule revision cannot be advanced.');
		const next: AgentFilePolicy = { revision: revision + 1, rules };
		store.put(kind, scope, null, next);
		return { scope, revision: next.revision };
	}) as { scope: string; revision: number };
}

export function agentFilePolicyMatchers(store: Store, projectId: string | null | undefined): { revision: string; denies: (rootRelativePath: string) => boolean } {
	const resolved = resolvedAgentFilePolicy(store, projectId);
	const matchers = [compileFilePolicy(resolved.global.rules), compileFilePolicy(resolved.project?.rules ?? [])];
	return { revision: resolved.revision, denies: rootRelativePath => filePolicyDenies(matchers, rootRelativePath) };
}
