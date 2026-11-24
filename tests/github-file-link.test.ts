import {expect,it} from 'vitest';
import {gitBlobId,githubBlobUrl,parseGitHubOrigin,upstreamRef} from '../packages/workspace/github-file-link.ts';
import {GitHubFileLinkSchema} from '../packages/contracts/github-file-link.ts';

it('parses admitted github.com origins',()=>{
 expect(parseGitHubOrigin('https://github.com/acme/widgets.git')).toEqual({owner:'acme',repo:'widgets'});
 expect(parseGitHubOrigin('https://github.com/acme/widgets')).toEqual({owner:'acme',repo:'widgets'});
 expect(parseGitHubOrigin('git@github.com:acme/widgets')).toEqual({owner:'acme',repo:'widgets'});
 expect(parseGitHubOrigin('git@github.com:acme/widgets.git')).toEqual({owner:'acme',repo:'widgets'});
 expect(parseGitHubOrigin('https://github.com/acme/my.repo')).toEqual({owner:'acme',repo:'my.repo'});
});
it('rejects non-admitted origins',()=>{
 for(const url of['http://github.com/acme/widgets','https://user:tok@github.com/acme/widgets','https://github.com.evil.com/acme/widgets','ssh://github.com/acme/widgets','https://github.com/acme/widgets/','https://github.com/acme/widgets/extra','https://github.com/acme/..','https://github.com/acme/.','','github.com/acme/widgets'])
  expect(parseGitHubOrigin(url)).toBeNull();
});
it('computes Git blob IDs for known payloads',()=>{
 expect(gitBlobId(Buffer.alloc(0))).toBe('e69de29bb2d1d6434b8b29ae775ad8c2e48c5391');
 expect(gitBlobId(Buffer.from('hello\n'))).toBe('ce013625030ba8dba906f756967f9e9ca394464a');
});
it('encodes each path segment for the blob URL',()=>{
 const base='https://github.com/acme/widgets/blob/'+'a'.repeat(40)+'/';
 expect(githubBlobUrl('acme','widgets','a'.repeat(40),'src/reader.ts')).toBe(base+'src/reader.ts');
 expect(githubBlobUrl('acme','widgets','a'.repeat(40),'docs/My Notes #1.md')).toBe(base+'docs/My%20Notes%20%231.md');
 expect(githubBlobUrl('acme','widgets','a'.repeat(40),'a%b?c')).toBe(base+'a%25b%3Fc');
 expect(githubBlobUrl('acme','widgets','a'.repeat(40),'café/é.md')).toBe(base+'caf%C3%A9/%C3%A9.md');
 expect(githubBlobUrl('acme','widgets','a'.repeat(40),'.hidden')).toBe(base+'.hidden');
});
it('resolves upstream per R4',()=>{
 expect(upstreamRef('main',{})).toEqual({ref:'refs/remotes/origin/main',refname:'origin/main'});
 expect(upstreamRef('main',{remote:'origin',merge:'refs/heads/release'})).toEqual({ref:'refs/remotes/origin/release',refname:'origin/release'});
 expect(upstreamRef('main',{remote:'upstream',merge:'refs/heads/main'})).toEqual({reason:'upstream-not-origin'});
 expect(upstreamRef('main',{remote:'origin'})).toEqual({reason:'upstream-not-origin'});
});
it('validates the response contract',()=>{
 const ready={state:'ready',url:'https://github.com/acme/widgets/blob/'+'a'.repeat(40)+'/src/x.ts',commit:'a'.repeat(40),repository:'acme/widgets',upstream:'origin/main',path:'src/x.ts'};
 expect(GitHubFileLinkSchema.parse(ready)).toEqual(ready);
 expect(GitHubFileLinkSchema.parse({state:'unavailable',reason:'not-on-upstream',detail:{branch:'main',commit:'abc1234',upstream:'origin/main'}})).toMatchObject({reason:'not-on-upstream'});
 expect(()=>GitHubFileLinkSchema.parse({state:'ready',url:'https://evil.com/x',commit:'a'.repeat(40),repository:'acme/widgets',upstream:'origin/main',path:'x'})).toThrow();
 expect(()=>GitHubFileLinkSchema.parse({state:'unavailable',reason:'nonsense'})).toThrow();
 expect(()=>GitHubFileLinkSchema.parse({state:'ready',url:'https://github.com/x',commit:'abc',repository:'acme/widgets',upstream:'o',path:'x',extra:1})).toThrow();
});
