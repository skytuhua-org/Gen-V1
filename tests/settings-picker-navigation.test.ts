import {expect, it} from 'vitest';
import {nextPickerIndex} from '../apps/web/src/PickerGroup';

it('wraps both axis keys and supports Home and End in the enabled radio order', () => {
  expect(nextPickerIndex('ArrowRight', 3, 4)).toBe(0);
  expect(nextPickerIndex('ArrowDown', 3, 4)).toBe(0);
  expect(nextPickerIndex('ArrowLeft', 0, 4)).toBe(3);
  expect(nextPickerIndex('ArrowUp', 0, 4)).toBe(3);
  expect(nextPickerIndex('Home', 2, 4)).toBe(0);
  expect(nextPickerIndex('End', 1, 4)).toBe(3);
  expect(nextPickerIndex('ArrowRight', 0, 1)).toBe(0);
  expect(nextPickerIndex('ArrowRight', 0, 0)).toBeNull();
  expect(nextPickerIndex('Tab', 1, 4)).toBeNull();
});
