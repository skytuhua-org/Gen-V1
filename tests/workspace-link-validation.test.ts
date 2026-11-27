import {expect,it} from 'vitest';
import {validateLinkNumber} from '../apps/web/src/WorkspaceSurfaceBody.tsx';

it('accepts base-10 integers inside the int4 range',()=>{
 expect(validateLinkNumber('12')).toBe(12);
 expect(validateLinkNumber('1')).toBe(1);
 expect(validateLinkNumber('2147483647')).toBe(2147483647);
});

it('rejects non-integer, non-positive and out-of-range input before any request',()=>{
 for(const raw of ['abc','1e5','1.5','-3','0','12x','2147483648','', '  ','00000000000'])expect(validateLinkNumber(raw)).toBeNull();
 // The plan's validator trims first, so padded digits parse as valid.
 expect(validateLinkNumber(' 12 ')).toBe(12);
});
