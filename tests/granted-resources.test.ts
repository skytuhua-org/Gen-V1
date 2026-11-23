import {expect, it} from 'vitest';
import {grantMeta, groupGrants} from '../apps/web/src/granted-resources';
import type {ShellResourceRow} from '../packages/contracts/shell-read-models';

const grant = (id: string, threadId: string, label: string, path = 'C:/docs/agreement.pdf'): ShellResourceRow =>
  ({id, threadId, kind: 'file', label, writable: false, path});

it('collapses identical per-thread grants into one sorted row', () => {
  const groups = groupGrants([
    grant('g3', 'shell', 'agreement.pdf'),
    grant('g1', 'signing', 'agreement.pdf'),
    {...grant('g2', 'catalog', 'agreement.pdf'), writable: true},
    grant('g4', 'signing', 'Budget.xlsx', 'C:/docs/budget.xlsx'),
  ]);
  expect(groups).toHaveLength(2);
  expect(groups[0].name).toBe('agreement.pdf'); // alphabetical, case-insensitive
  expect(groups[0].grants).toHaveLength(3);
  expect(groups[0].writable).toBe(true);
  expect(groups[0].threadIds.sort()).toEqual(['catalog', 'shell', 'signing']);
  expect(grantMeta(groups[0], undefined)).toBe('Granted to 3 threads');
  expect(grantMeta(groups[1], 'Sign the service agreement')).toBe('Granted to Sign the service agreement');
  expect(grantMeta(groups[1], 'A thread title that goes well beyond forty characters')).toBe('Granted to ' + 'A thread title that goes well beyond forty characters'.slice(0, 40) + '…');
});

it('keeps distinct kinds and paths as separate rows', () => {
  const groups = groupGrants([
    grant('g1', 't', 'doc.pdf', 'C:/a/doc.pdf'),
    {...grant('g2', 't', 'doc.pdf', 'C:/a/doc.pdf'), kind: 'database' as const},
    grant('g3', 't', 'doc.pdf', 'C:/b/doc.pdf'),
  ]);
  expect(groups).toHaveLength(3);
  expect(grantMeta(groups[0], undefined)).toBe('Granted to 1 thread');
});
