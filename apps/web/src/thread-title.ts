import {normalizeThreadTitle,type Thread} from '../../../packages/contracts';

export function displayThreadTitle(thread?:Pick<Thread,'title'>|null,fallback='New conversation'):string {
  return thread ? normalizeThreadTitle(thread.title)||fallback : fallback;
}
