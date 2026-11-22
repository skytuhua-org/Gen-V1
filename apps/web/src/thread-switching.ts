import type { Thread } from '../../../packages/contracts';
import type { UiPreferences } from '../../../packages/contracts/preferences';
import { orderSidebarProjects } from './ShellSidebar';

/** Sidebar status filter mirrored from ShellSidebar (all | working | waiting). */
export type SidebarRowFilter = 'all' | 'working' | 'waiting';

export interface SidebarRowContext {
  filter: SidebarRowFilter;
  projectGrouping: boolean;
  projectOrder: UiPreferences['projectOrder'];
  showWorkingSection: boolean;
  folded: Record<string, boolean | undefined>;
  showAllSettled: boolean;
}

const isWorking = (item: Thread) => Boolean(item.runId) || item.status === 'working' || item.status === 'awaiting_input';

/**
 * Ids of the thread rows the sidebar is showing, in top-to-bottom order:
 * Pinned -> Working -> project-ordered list -> Settled (capped at 6 unless
 * expanded). Folded sections contribute no rows. Kept identical to the
 * render path in ShellSidebar so Ctrl+1..9 targets the row the user sees.
 */
export function sidebarRowIds(matching: readonly Thread[], ctx: SidebarRowContext): string[] {
  const visible = matching.filter(
    item =>
      ctx.filter === 'all' ||
      (ctx.filter === 'working' && (Boolean(item.runId) || item.status === 'working')) ||
      (ctx.filter === 'waiting' && item.status === 'awaiting_input'),
  );
  const pinnedAll = visible.filter(item => item.presentation?.pinned);
  const workingAll = ctx.showWorkingSection ? visible.filter(item => !item.presentation?.pinned && isWorking(item)) : [];
  const settledAll = visible.filter(item => !pinnedAll.includes(item) && !workingAll.includes(item) && item.presentation?.settled);
  const remaining = visible.filter(item => !pinnedAll.includes(item) && !workingAll.includes(item) && !settledAll.includes(item));
  const ordered = orderSidebarProjects(remaining, ctx.projectGrouping, ctx.projectOrder);
  const settled = ctx.showAllSettled ? settledAll : settledAll.slice(0, 6);
  return [
    ...(ctx.folded['pinned'] ? [] : pinnedAll),
    ...(ctx.folded['working'] ? [] : workingAll),
    ...ordered,
    ...(ctx.folded['settled'] ? [] : settled),
  ].map(item => item.id);
}

/** Ctrl+1..9 target: the Nth visible sidebar row, or null when out of range. */
export function sidebarDigitTarget(matching: readonly Thread[], ctx: SidebarRowContext, slot: number): string | null {
  if (slot < 1 || slot > 9) return null;
  return sidebarRowIds(matching, ctx)[slot - 1] ?? null;
}

/**
 * Next unread thread in sidebar order after the active row, wrapping once.
 * Returns null when no other visible row is unread.
 */
export function nextUnreadId(matching: readonly Thread[], ctx: SidebarRowContext, activeId: string | null): string | null {
  const order = sidebarRowIds(matching, ctx);
  if (!order.length) return null;
  const byId = new Map(matching.map(item => [item.id, item]));
  const start = Math.max(0, order.indexOf(activeId ?? ''));
  for (let step = 1; step <= order.length; step += 1) {
    const id = order[(start + step) % order.length]!;
    if (id !== activeId && byId.get(id)?.presentation?.unread) return id;
  }
  return null;
}

/**
 * Next unread id inside an already-projected row order (from ShellSidebar's
 * `onRowOrder`), wrapping once after the active row. Null when none.
 */
export function nextUnreadInOrder(order: readonly string[], threads: readonly Thread[], activeId: string | null): string | null {
  if (!order.length) return null;
  const unread = new Set(threads.filter(item => item.presentation?.unread).map(item => item.id));
  const start = Math.max(0, order.indexOf(activeId ?? ''));
  for (let step = 1; step <= order.length; step += 1) {
    const id = order[(start + step) % order.length]!;
    if (id !== activeId && unread.has(id)) return id;
  }
  return null;
}

export const MRU_CAP = 32;

/** Push `id` to the front of the MRU list (dedup, capped at MRU_CAP). */
export function mruPush(mru: readonly string[], id: string, cap: number = MRU_CAP): string[] {
  return [id, ...mru.filter(existing => existing !== id)].slice(0, cap);
}

/** MRU ordering trimmed to ids still present in `visible`. */
export function mruVisible(mru: readonly string[], visible: readonly string[]): string[] {
  const inSidebar = new Set(visible);
  return mru.filter(id => inSidebar.has(id));
}
