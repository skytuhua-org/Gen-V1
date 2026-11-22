import { expect, it } from 'vitest';
import type { Message } from '../packages/contracts';
import { dedupeReplayedFrames } from '../apps/web/src/thread-messages';

const message = (id: string, threadId = 't1', role: Message['role'] = 'assistant', content = 'done') => ({ id, threadId, role, content, createdAt: id, runId: 'r' });

it('drops a replayed frame equal to the thread\u2019s last message', () => {
  const merged = dedupeReplayedFrames([
    message('m1', 't1', 'user', 'hi'),
    message('m2', 't1', 'assistant', 'answer'),
    message('m3-replay', 't1', 'assistant', 'answer'),
  ]);
  expect(merged.map(item => item.id)).toEqual(['m1', 'm2']);
});

it('keeps the identical message object list when nothing replayed', () => {
  const frames = [message('m1'), message('m2', 't1', 'assistant', 'answer'), message('m3', 't1', 'assistant', 'next')];
  expect(dedupeReplayedFrames(frames)).toBe(frames);
});

it('keeps identical content when separated by another message', () => {
  const frames = [
    message('m1', 't1', 'assistant', 'answer'),
    message('m2', 't1', 'user', 'follow-up'),
    message('m3', 't1', 'assistant', 'answer'),
  ];
  expect(dedupeReplayedFrames(frames)).toHaveLength(3);
});

it('keeps same content when the role differs', () => {
  const frames = [
    message('m1', 't1', 'assistant', 'answer'),
    message('m2', 't1', 'user', 'answer'),
  ];
  expect(dedupeReplayedFrames(frames)).toHaveLength(2);
});

it('tracks the last frame per thread when messages interleave', () => {
  const frames = [
    message('a1', 't1', 'assistant', 'answer'),
    message('b1', 't2', 'assistant', 'other'),
    message('a2-replay', 't1', 'assistant', 'answer'),
    message('b2', 't2', 'assistant', 'new'),
  ];
  expect(dedupeReplayedFrames(frames).map(item => item.id)).toEqual(['a1', 'b1', 'b2']);
});
