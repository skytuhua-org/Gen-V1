export type TooltipGroup = {
  boundary: object; ownerKey: string; document: object;
  dialog: object | null; modal: object | null;
};
export type TooltipWarmth = { group: TooltipGroup; deadline: number | null };
export type TooltipOpening = 'pointer-cold' | 'pointer-warm' | 'keyboard';

export function sameTooltipGroup(a: TooltipGroup, b: TooltipGroup): boolean {
  return a.boundary === b.boundary && a.ownerKey === b.ownerKey && a.document === b.document && a.dialog === b.dialog && a.modal === b.modal;
}

export function pointerOpening(warm: TooltipWarmth | null, group: TooltipGroup | null, now: number): 'pointer-cold' | 'pointer-warm' {
  if (!warm || !group || !Number.isFinite(now) || !sameTooltipGroup(warm.group, group)) return 'pointer-cold';
  if (warm.deadline === null) return 'pointer-warm';
  return Number.isFinite(warm.deadline) && now < warm.deadline ? 'pointer-warm' : 'pointer-cold';
}

export function openedTooltipGroup(group: TooltipGroup | null, kind: TooltipOpening): TooltipWarmth | null {
  return group && kind !== 'keyboard' ? { group, deadline: null } : null;
}

export function gapTooltipGroup(warm: TooltipWarmth | null, now: number): TooltipWarmth | null {
  if (!warm || !Number.isFinite(now)) return null;
  if (warm.deadline === null) return { group: warm.group, deadline: now + 300 };
  if (!Number.isFinite(warm.deadline) || now >= warm.deadline) return null;
  return { group: warm.group, deadline: warm.deadline };
}
