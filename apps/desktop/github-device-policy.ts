import type {DesktopSurface} from '../../packages/desktop-contract/index.ts';

export const GITHUB_DEVICE_URL='https://github.com/login/device';
export function githubDeviceAllowed(surface:DesktopSurface):boolean{
 return surface.kind==='main'||surface.kind==='thread'||surface.kind==='workspace'&&(surface.tab==='pull-request'||surface.tab==='linked-pull-requests');
}
