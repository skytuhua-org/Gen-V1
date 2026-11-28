import type { ModelInfo } from '../../../packages/contracts/index.ts';
import type { UiPreferences } from '../../../packages/contracts/preferences.ts';
import type { WorkspaceAuthority } from '../../../packages/contracts/workspace.ts';
import { projectColorKey } from './project-colors.ts';

export type ModelSource = 'explicit' | 'project' | 'project-unavailable' | 'global' | 'first' | 'bound';

/** Journal keys for the per-owner explicit model choice (R04) and reasoning-edit flag. */
export const modelChoiceKey = (owner: string) => `modelChoice:${owner}`;
export const thinkingExplicitKey = (owner: string) => `thinkingExplicit:${owner}`;

/** Resolution sources that must not be overridden by a later global default change. */
export const modelSourceLocks = (source?: ModelSource) => source === 'explicit' || source === 'project' || source === 'project-unavailable';

/** R05: a composer pick under a project default keeps the global default untouched. */
export const pickWritesGlobalDefault = (resolution: { projectDefault?: unknown }) => !resolution.projectDefault;
export interface ResolvedModel { modelId: string; thinkingLevel: string; source: ModelSource; reasoningDropped: boolean }

export function projectModelDefaultFor(preferences: UiPreferences, authority: WorkspaceAuthority, projectId: string): { modelId: string; thinkingLevel: string | null } | null {
  return preferences.projectModelDefaults[projectColorKey(authority, projectId)] ?? null;
}

/** Resolution order for an unbound thread or draft: explicit composer choice > project default > global default > first advertised model (R03). Pure; the composers supply their already-loaded catalog. */
export function resolveNewThreadModel(input: {
  bound: boolean;
  boundModelId?: string | null;
  explicitModelId?: string | null;
  explicitThinking?: string | null;
  project?: { modelId: string; thinkingLevel: string | null } | null;
  globalModelId?: string | null;
  catalog: ModelInfo[];
}): ResolvedModel {
  const { catalog } = input;
  const entry = (id: string) => catalog.find(model => model.id === id);
  if (input.bound) return { modelId: input.boundModelId ?? '', thinkingLevel: '', source: 'bound', reasoningDropped: false };
  if (input.explicitModelId && entry(input.explicitModelId)) {
    const model = entry(input.explicitModelId)!;
    const thinking = input.explicitThinking && model.thinkingLevels?.includes(input.explicitThinking) ? input.explicitThinking : '';
    return { modelId: input.explicitModelId, thinkingLevel: thinking, source: 'explicit', reasoningDropped: false };
  }
  if (input.project) {
    const model = entry(input.project.modelId);
    if (!model) return { modelId: '', thinkingLevel: '', source: 'project-unavailable', reasoningDropped: false };
    const candidate = input.explicitThinking ?? input.project.thinkingLevel;
    const advertised = Boolean(candidate && model.thinkingLevels?.includes(candidate));
    return { modelId: input.project.modelId, thinkingLevel: advertised ? candidate! : '', source: 'project', reasoningDropped: Boolean(candidate) && !advertised };
  }
  if (input.globalModelId && entry(input.globalModelId)) return { modelId: input.globalModelId, thinkingLevel: '', source: 'global', reasoningDropped: false };
  return { modelId: catalog[0]?.id ?? '', thinkingLevel: '', source: 'first', reasoningDropped: false };
}
