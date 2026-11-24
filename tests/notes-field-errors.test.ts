import {describe,expect,it} from 'vitest';
import {HarnessError} from '../packages/contracts/index.ts';
import {memoryErrorField} from '../apps/web/src/TaskMemory.tsx';

describe('memoryErrorField',()=>{
 it('routes INVALID_MEMORY to the key field when the key is invalid',()=>{
  expect(memoryErrorField(new HarnessError('INVALID_MEMORY','Choose a short note key using letters, digits, periods or dashes.'),'bad key')).toBe('key');
  expect(memoryErrorField(new HarnessError('INVALID_MEMORY','x'),'-lead')).toBe('key');
  expect(memoryErrorField(new HarnessError('INVALID_MEMORY','x'),'a'.repeat(65))).toBe('key');
 });
 it('routes INVALID_MEMORY to content when the key is valid',()=>{
  expect(memoryErrorField(new HarnessError('INVALID_MEMORY','Keep notes brief and omit passwords, tokens and private keys.'),'date-format')).toBe('content');
 });
 it('keeps other failures at form level',()=>{
  expect(memoryErrorField(new HarnessError('STALE_MEMORY','This note changed.'),'date-format')).toBeNull();
  expect(memoryErrorField(new HarnessError('MEMORY_FULL','Thread notes are full.'),'date-format')).toBeNull();
  expect(memoryErrorField(new Error('network down'),'date-format')).toBeNull();
  expect(memoryErrorField('nope','date-format')).toBeNull();
 });
});
