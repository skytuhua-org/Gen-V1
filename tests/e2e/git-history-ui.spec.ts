import {expect,test} from '@playwright/test';

// Fixture-backed Git history coverage (T03/R1-R6). ?git= selects the stub adapter state.
const tab=(page:import('@playwright/test').Page)=>page.getByRole('tab',{name:'Git history',exact:true});
for(const width of [1440,1024,768])test(`Git history commits and detail fit ${width}`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:1000});await page.goto('/file-checkpoints?git=full');
 await expect(tab(page)).toBeVisible();await tab(page).click();
 await expect(page.getByText('Commit 2 with a very long subject',{exact:false})).toBeVisible();
 await expect(page.getByText('Unpushed',{exact:true}).first()).toBeVisible();
 await page.screenshot({path:testInfo.outputPath(`git-list-${width}.png`),fullPage:true});
 await page.getByRole('button',{name:/Commit 2 with/}).click();
 await expect(page.getByRole('button',{name:'Copy SHA'})).toBeVisible();
 await expect(page.locator('.git-history-sha code')).toContainText('0'.repeat(38)+'02');
 await page.locator('.git-history-file summary',{hasText:'src/workspace-layout.ts'}).click();
 await expect(page.locator('.git-history-file .unified-diff')).toContainText('+const panelHeight = 420;');
 await page.locator('.git-history-file summary',{hasText:'assets/logo.png'}).click();
 await expect(page.getByText('Binary file — no text diff',{exact:true})).toBeVisible();
 await page.screenshot({path:testInfo.outputPath(`git-detail-${width}.png`),fullPage:true});
 await page.getByRole('button',{name:'Back to commits'}).click();
 await expect(page.getByRole('button',{name:/Commit 2 with/})).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('Load more appends the next page',async({page})=>{
 await page.goto('/file-checkpoints?git=full');await tab(page).click();
 await expect(page.locator('.git-history-entries button')).toHaveCount(50);
 await page.getByRole('button',{name:'Load more'}).click();
 await expect(page.locator('.git-history-entries button')).toHaveCount(55);
 await expect(page.getByRole('button',{name:'Load more'})).toHaveCount(0);
});
test('empty, error and stale states are honest',async({page})=>{
 await page.goto('/file-checkpoints?git=empty');await tab(page).click();
 await expect(page.getByText('No commits yet',{exact:true})).toBeVisible();
 await page.goto('/file-checkpoints?git=error');await tab(page).click();
 await expect(page.getByRole('alert')).toContainText('Commit history is unavailable.');
 await page.goto('/file-checkpoints?git=stale');await tab(page).click();
 await expect(page.getByRole('alert')).toContainText('History changed. Refresh history to continue.');
});
test('empty commit and root basis render',async({page})=>{
 await page.goto('/file-checkpoints?git=no-files');await tab(page).click();
 await page.getByRole('button',{name:/Commit 2 with/}).click();
 await expect(page.getByText('No files changed in this commit',{exact:true})).toBeVisible();
});
