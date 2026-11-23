import type {ShellResourceRow} from '../../../packages/contracts/shell-read-models';

export interface GrantedResourceGroup {
  /** Stable grouping key: resource identity (kind + path). */
  key: string;
  name: string;
  kind: ShellResourceRow['kind'];
  writable: boolean;
  path: string;
  grants: {id: string; threadId: string}[];
  threadIds: string[];
}

/** One row per unique resource; identical per-thread grants collapse together. */
export function groupGrants(resources: ShellResourceRow[]): GrantedResourceGroup[] {
  const groups = new Map<string, GrantedResourceGroup>();
  for (const grant of resources) {
    const key = `${grant.kind}:${grant.path}`;
    const group = groups.get(key);
    if (group) {
      group.grants.push({id: grant.id, threadId: grant.threadId});
      if (!group.threadIds.includes(grant.threadId)) group.threadIds.push(grant.threadId);
      group.writable ||= grant.writable;
    } else {
      groups.set(key, {key, name: grant.label || grant.path, kind: grant.kind, writable: grant.writable, path: grant.path, grants: [{id: grant.id, threadId: grant.threadId}], threadIds: [grant.threadId]});
    }
  }
  return [...groups.values()].sort((left, right) => left.name.toLowerCase().localeCompare(right.name.toLowerCase()));
}

export function grantMeta(group: GrantedResourceGroup, title: string | undefined): string {
  if (group.threadIds.length === 1 && title) return 'Granted to ' + (title.length > 40 ? title.slice(0, 40) + '…' : title);
  return `Granted to ${group.threadIds.length} ${group.threadIds.length === 1 ? 'thread' : 'threads'}`;
}
